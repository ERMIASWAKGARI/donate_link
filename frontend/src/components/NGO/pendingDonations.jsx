import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import URL from "../../constants/api";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../../context/UserContext";

const PendingDonations = () => {
  const { user } = useContext(UserContext);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchDonations = async () => {
    try {
      const response = await axiosInstance.get(
        `${URL}/organization/material`,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDonations(response.data.message.donations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDonations();
  }, []);
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((skeleton) => (
          <div
            key={skeleton}
            className="animate-pulse p-4 border rounded-lg shadow-md bg-gray-300 dark:bg-gray-700"
          >
            <div className="h-32 bg-gray-400 dark:bg-gray-600 rounded-md"></div>
            <div className="mt-2 h-4 bg-gray-400 dark:bg-gray-600 w-3/4 rounded"></div>
            <div className="mt-2 h-3 bg-gray-400 dark:bg-gray-600 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  const handleRequest = async (donationId) => {
    try {
      const ngoId = user?._id;

      if (!ngoId) {
        throw new Error("NGO information not found");
      }

      const response = await axiosInstance.post(
        `/organization/material/${donationId}/request`,
        { ngoId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the local state immediately
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === donationId
            ? { ...donation, status: "requested" }
            : donation
        )
      );

      toast.success("Donation requested successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || "Failed to request donation", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const openDetailsModal = (donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDonation(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Donations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div key={donation._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {donation.materialDetails.category}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  donation.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : donation.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {donation.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">
              {donation.materialDetails.description ||
                "No description provided"}
            </p>

            {donation.images && donation.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {donation.images.map((pic, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={`http://localhost:5000${pic}`}
                      alt={`Donation ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Quantity: {donation.materialDetails.quantity}</p>
              <p>Category: {donation.materialDetails.category}</p>
              <p>Subcategory: {donation.materialDetails.subCategory}</p>
              <p>Tracking ID: {donation.trackingId}</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleRequest(donation._id)}
                className={`px-4 py-2 rounded-lg border-2 ${
                  donation.status === "pending"
                    ? "bg-white text-gray-500 border-yellow-500 hover:bg-yellow-500 hover:text-[#008080] cursor-pointer"
                    : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                }`}
                disabled={donation.status !== "pending"}
              >
                Request
              </button>
              <button
                onClick={() => openDetailsModal(donation)}
                className="px-4 py-2 text-yellow-400 hover:text-yellow-600 cursor-pointer rounded"
              >
                <FaEye size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">
                Donation Details - {selectedDonation.trackingId}
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Material Details</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {selectedDonation.materialDetails.category}
                  </p>
                  <p>
                    <span className="font-medium">Subcategory:</span>{" "}
                    {selectedDonation.materialDetails.subCategory}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {selectedDonation.materialDetails.quantity}{" "}
                    {selectedDonation.materialDetails.unit}
                  </p>
                  <p>
                    <span className="font-medium">Condition:</span>{" "}
                    {selectedDonation.materialDetails.condition}
                  </p>
                  <p>
                    <span className="font-medium">Expiration Date:</span>{" "}
                    {new Date(
                      selectedDonation.materialDetails.expirationDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {selectedDonation.materialDetails.description ||
                      "No description provided"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Location Details</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {selectedDonation.address}
                  </p>
                  <p>
                    <span className="font-medium">Coordinates:</span>{" "}
                    {selectedDonation.location.coordinates.join(", ")}
                  </p>
                </div>

                <h4 className="text-lg font-semibold mt-4 mb-2">Donor Info</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedDonation.donor?.name || "Anonymous"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedDonation.donor?.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {selectedDonation.images && selectedDonation.images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedDonation.images.map((pic, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={`http://localhost:5000${pic}`}
                        alt={`Donation ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDonations;

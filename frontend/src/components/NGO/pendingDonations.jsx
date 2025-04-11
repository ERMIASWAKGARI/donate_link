import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import URL from "../../constants/api";
import {
  FaEye,
  FaMapMarkerAlt,
  FaUser,
  FaBoxOpen,
  FaCalendarAlt,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
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
      const response = await axiosInstance.get(`${URL}/organization/material`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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

  const handleRequest = async (donationId) => {
    try {
      const ngoId = user?._id;
      if (!ngoId) throw new Error("NGO information not found");

      await axiosInstance.post(
        `/organization/material/${donationId}/request`,
        { ngoId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
        progressStyle: { backgroundColor: "#4CAF50" },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request donation", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        progressStyle: { backgroundColor: "#F44336" },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between pt-4">
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-full w-10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchDonations}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Available Donations
          </h1>
          <p className="text-gray-600">
            Browse and request donations from generous donors
          </p>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No donations available at the moment
            </h3>
            <p className="text-gray-500 mb-4">
              Check back later for new donation opportunities
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div
                key={donation._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {donation.images?.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`http://localhost:5000${donation.images[0]}`}
                      alt="Donation"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                      {donation.materialDetails.category}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {donation.materialDetails.description ||
                      "No description provided"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaBoxOpen className="mr-2 text-gray-400" />
                      {donation.materialDetails.quantity}{" "}
                      {donation.materialDetails.unit}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" />
                      {donation.address?.split(",")[0] || "Location"}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <button
                      onClick={() => handleRequest(donation._id)}
                      disabled={donation.status !== "pending"}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        donation.status === "pending"
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {donation.status === "pending" ? "Request" : "Requested"}
                    </button>
                    <button
                      onClick={() => openDetailsModal(donation)}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      title="View details"
                    >
                      <FaEye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Details Modal */}
        {showDetailsModal && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedDonation.materialDetails.category}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedDonation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedDonation.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedDonation.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {selectedDonation.trackingId}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaInfoCircle className="mr-2 text-blue-500" />
                        Material Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">
                            {selectedDonation.materialDetails.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Subcategory</p>
                          <p className="font-medium">
                            {selectedDonation.materialDetails.subCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium">
                            {selectedDonation.materialDetails.description ||
                              "No description"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaBoxOpen className="mr-2 text-blue-500" />
                        Item Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium">
                            {selectedDonation.materialDetails.quantity}{" "}
                            {selectedDonation.materialDetails.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Condition</p>
                          <p className="font-medium">
                            {selectedDonation.materialDetails.condition}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expiration</p>
                          <p className="font-medium">
                            {new Date(
                              selectedDonation.materialDetails.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        Location Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">
                            {selectedDonation.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Coordinates</p>
                          <p className="font-medium">
                            {selectedDonation.location.coordinates.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUser className="mr-2 text-blue-500" />
                        Donor Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {selectedDonation.donor?.name || "Anonymous"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">
                            {selectedDonation.donor?.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDonation.images?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedDonation.images.map((pic, index) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden shadow-sm"
                        >
                          <img
                            src={`http://localhost:5000${pic}`}
                            alt={`Donation ${index + 1}`}
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button
                    onClick={() => handleRequest(selectedDonation._id)}
                    disabled={selectedDonation.status !== "pending"}
                    className={`px-5 py-2 rounded-lg font-medium mr-3 ${
                      selectedDonation.status === "pending"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {selectedDonation.status === "pending"
                      ? "Request Donation"
                      : "Already Requested"}
                  </button>
                  <button
                    onClick={closeDetailsModal}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDonations;

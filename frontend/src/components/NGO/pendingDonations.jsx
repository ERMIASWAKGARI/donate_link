import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../config/axiosConfig";
import URL from "../../constants/api";
import {
  FaEye,
  FaMapMarkerAlt,
  FaUser,
  FaBoxOpen,
  FaTimes,
  FaCamera,
  FaInfoCircle,
  FaHandshake,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../../context/UserContext";
import { Spin } from "antd";

import Map from "./Map";
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
      console.log("donations", donations);
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

      toast.success("Donation request sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progressStyle: { backgroundColor: "#4CAF50" },
      });
      fetchDonations(); // Refresh the list
      if (selectedDonation?._id === donationId) {
        setSelectedDonation((prev) => ({
          ...prev,
          requests: [...prev.requests, ngoId],
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request donation", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        progressStyle: { backgroundColor: "#F44336" },
      });
    }
  };

  const handleCancelRequest = async (donationId) => {
    try {
      const ngoId = user?._id;
      if (!ngoId) throw new Error("NGO information not found");

      await axiosInstance.delete(
        `/organization/material/${donationId}/request`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { ngoId },
        }
      );

      toast.success("Request cancelled successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        progressStyle: { backgroundColor: "#4CAF50" },
      });
      fetchDonations(); // Refresh the list
      if (selectedDonation?._id === donationId) {
        setSelectedDonation((prev) => ({
          ...prev,
          requests: prev.requests.filter((id) => id !== ngoId),
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request", {
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
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-full">
        <Spin size="large" />
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
            {donations
              .filter((donation) => donation.status === "posted")
              .map((donation) => (
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
                      <div>here is picture</div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                        {donation.materialDetails.category}
                      </h3>
                      {donation?.requests?.includes(user._id) && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            donation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : donation.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          requested
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {donation.description || "No description provided"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaBoxOpen className="mr-2 text-gray-400" />
                        {donation.materialDetails.quantity}{" "}
                        {donation.materialDetails.unit}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {donation?.address?.city?.split(",")[0] || "Location"}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <button
                        onClick={() => handleRequest(donation._id)}
                        disabled={donation.requests.includes(user._id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          !donation.requests.includes(user._id)
                            ? "border border[#008080] text-[#008080] hover:text-white hover:bg-[#008080]"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {donation.requests.includes(user._id)
                          ? "Requested"
                          : "Request"}
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
        {showDetailsModal && selectedDonation && (
          <div className="fixed inset-0 bg-white/40 bg-opacity-50 flex items-center justify-center p-4 z-1000 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 ease-out">
              {/* Header */}
              <div className="sticky z-2000 top-0 bg-white z-10 p-6 pb-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {selectedDonation.materialDetails.category}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
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
                      {new Date(
                        selectedDonation.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Image Gallery */}
                {selectedDonation.images?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaCamera className="mr-2 text-teal-600" />
                      Donation Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedDonation.images.map((pic, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
                        >
                          <img
                            src={`http://localhost:5000/uploads/${pic.replace(
                              /\\/g,
                              "/"
                            )}`}
                            alt={`Donation item ${index + 1}`}
                            className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="text-white text-sm truncate">
                              {selectedDonation.materialDetails.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Material Details Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaInfoCircle className="mr-2 text-teal-600" />
                        Material Information
                      </h3>
                      <div className="space-y-3">
                        <DetailRow
                          label="Category"
                          value={selectedDonation.materialDetails.category}
                        />
                        <DetailRow
                          label="Subcategory"
                          value={selectedDonation.materialDetails.subCategory}
                        />
                        <DetailRow
                          label="Description"
                          value={
                            selectedDonation.description || "Not specified"
                          }
                        />
                      </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaBoxOpen className="mr-2 text-teal-600" />
                        Item Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailRow
                          label="Quantity"
                          value={`${selectedDonation.materialDetails.quantity} ${selectedDonation.materialDetails.unit}`}
                        />
                        <DetailRow
                          label="Condition"
                          value={selectedDonation.materialDetails.condition}
                        />
                        <DetailRow
                          label="Expiration"
                          value={new Date(
                            selectedDonation.materialDetails.expirationDate
                          ).toLocaleDateString()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Location Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-teal-600" />
                        Location Details
                      </h3>
                      <div className="space-y-3">
                        <DetailRow
                          label="Address"
                          value={selectedDonation?.address?.city}
                        />
                        <div className=" rounded-lg overflow-hidden z-0 border border-gray-200">
                          <Map
                            latitude={selectedDonation.location.coordinates[1]}
                            longitude={selectedDonation.location.coordinates[0]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Donor Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FaUser className="mr-2 text-teal-600" />
                        Donor Information
                      </h3>
                      <div className="space-y-3">
                        <DetailRow
                          label="Name"
                          value={selectedDonation.donor?.name || "Anonymous"}
                        />
                        <DetailRow
                          label="Email"
                          value={
                            selectedDonation.donor?.email || "Not provided"
                          }
                        />
                        {selectedDonation.donor?.phone && (
                          <DetailRow
                            label="Phone"
                            value={selectedDonation.donor.phone}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky z-1000 bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-6 px-6">
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() =>
                        selectedDonation.requests.includes(user._id)
                          ? handleCancelRequest(selectedDonation._id)
                          : handleRequest(selectedDonation._id)
                      }
                      className={`px-6 py-3 rounded-lg font-medium transition flex-1 sm:flex-none flex items-center justify-center gap-2 ${
                        selectedDonation.requests.includes(user._id)
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
                      }`}
                    >
                      {selectedDonation.requests.includes(user._id) ? (
                        <>
                          <FaTimes /> Cancel Request
                        </>
                      ) : (
                        <>
                          <FaHandshake /> Request This Donation
                        </>
                      )}
                    </button>
                    <button
                      onClick={closeDetailsModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-1 sm:flex-none"
                    >
                      Close Details
                    </button>
                  </div>
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
// eslint-disable-next-line react/prop-types
const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 font-medium">{value || "-"}</p>
  </div>
);

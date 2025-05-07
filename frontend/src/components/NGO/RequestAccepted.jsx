import { useState, useContext, useEffect } from "react";
import axios from "../../config/axiosConfig";
import {
  FaBoxOpen,
  FaHandsHelping,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaDonate,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { UserContext } from "../../context/UserContext";
import Modal from "react-modal";
import Map from "./Map";
import { formatDistanceToNow } from "date-fns";
Modal.setAppElement("#root");

const NGODonationRequests = () => {
  const { user } = useContext(UserContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDonation, setExpandedDonation] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/organization/requestAccepted/${user._id}`
        );
        setDonations(response.data.data.donations);
        console.log("response", response);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user._id]);

  const handleDonationClick = (donationId) => {
    // If clicking the already expanded donation, collapse it
    if (expandedDonation === donationId) {
      setExpandedDonation(null);
    }
    // Otherwise, expand the clicked donation and collapse any others
    else {
      setExpandedDonation(donationId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-2xl mr-2" />
        <span>Loading donations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading donations: {error}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No donation requests found</h3>
        <p className="text-gray-500">
          This NGO hasn&apos;t received any donations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div
          key={donation._id}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleDonationClick(donation.id)}
          >
            <div className="flex items-center space-x-4">
              {donation.donationType === "money" ? (
                <FaDonate className="text-green-500 text-xl" />
              ) : donation.donationType === "material" ? (
                <FaBoxOpen className="text-blue-500 text-xl" />
              ) : (
                <FaHandsHelping className="text-purple-500 text-xl" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {donation.title || `Donation #${donation.trackingId}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(donation.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  donation.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : donation.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {donation.status}
              </span>
              {expandedDonation === donation.id ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </div>
          </div>
          {expandedDonation === donation.id && (
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase">
                    Description
                  </h4>
                  <p className="mt-2 text-gray-800">
                    {donation.description || "No description provided"}
                  </p>
                </div>

                {/* Donor Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase">
                    Donor
                  </h4>
                  <p className="mt-2 text-gray-800">
                    Donated by{" "}
                    <strong>{donation.donor?.name || "Anonymous"}</strong>
                  </p>
                  {donation.donor?.email && (
                    <p className="text-sm text-gray-500">
                      {donation.donor.email}
                    </p>
                  )}
                  <p className="text-sm text-[#008080] mt-3 bg-blue-50 border-l-4 border-blue-400 px-4 py-2 rounded">
                    <span className="font-medium">Note:</span> Please use
                    Tracking ID:{" "}
                    <strong className="text-yellow-500">
                      {donation.trackingId}
                    </strong>{" "}
                    to track materials given to you 🙏
                  </p>
                </div>

                {/* Need Info */}
                {donation.need && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 uppercase">
                      Need
                    </h4>
                    <p className="mt-2 text-gray-800 font-medium">
                      {donation.need.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {donation.need.description}
                    </p>
                  </div>
                )}

                {/* Materials */}
                {donation.materials?.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                      Donated Materials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {donation.materials.map((material, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                        >
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">
                              Category:
                            </span>{" "}
                            {material.categoryName}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">
                              Subcategory:
                            </span>{" "}
                            {material.subCategoryName}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">
                              Quantity:
                            </span>{" "}
                            {material.quantity} {material.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="mt-6 flex flex-col gap-3">
                {donation.location?.coordinates && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Location available
                  </p>
                )}
                <Map
                  latitude={donation?.location?.coordinates[1]}
                  longitude={donation?.location?.coordinates[0]}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NGODonationRequests;

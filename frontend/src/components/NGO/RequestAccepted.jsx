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
Modal.setAppElement("#root");

const NGODonationRequests = () => {
  const { user } = useContext(UserContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDonation, setExpandedDonation] = useState(null);
  const [trackingId, setTrackingId] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your location. Please enable location services."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const openGoogleMaps = (destinationCoords) => {
    if (!destinationCoords || !currentLocation) return;

    const [destLng, destLat] = destinationCoords;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const handleMarkAsCompleted = async (donationId) => {
    if (!trackingId.trim()) {
      alert("Please enter a tracking ID");
      return;
    }

    try {
      await axios.patch(`/donation/${donationId}/status`, {
        status: "completed",
        trackingId: trackingId.trim(),
      });

      setDonations(
        donations.map((donation) =>
          donation._id === donationId
            ? { ...donation, status: "completed" }
            : donation
        )
      );
      setTrackingId("");
      alert("Donation marked as completed successfully");
    } catch (err) {
      console.error("Error updating donation status:", err);
      alert("Failed to update donation status");
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
            onClick={() =>
              setExpandedDonation(
                expandedDonation === donation._id ? null : donation._id
              )
            }
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
                  {new Date(donation.createdAt).toLocaleDateString()}
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
              {expandedDonation === donation._id ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </div>
          </div>

          {expandedDonation === donation._id && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Description
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {donation.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Donor</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {donation.donor?.name || "Anonymous"}
                  </p>
                  {donation.donor?.email && (
                    <p className="text-sm text-gray-500">
                      {donation.donor.email}
                    </p>
                  )}
                </div>

                {donation.need && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Need</h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {donation.need.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {donation.need.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Details</h4>
                  {donation.donationType === "money" && (
                    <p className="mt-1 text-sm text-gray-900">
                      {donation.amount} {donation.currency}
                    </p>
                  )}
                  {donation.donationType === "material" && (
                    <>
                      <p className="mt-1 text-sm text-gray-900">
                        {donation.materialDetails?.quantity}{" "}
                        {donation.materialDetails?.unit} of{" "}
                        {donation.materialDetails?.category}
                      </p>
                      {donation.location?.coordinates && (
                        <p className="mt-1 text-sm text-gray-500 flex items-center">
                          <FaMapMarkerAlt className="mr-1" />
                          Location available
                        </p>
                      )}
                    </>
                  )}
                  {donation.donationType === "service" && (
                    <p className="mt-1 text-sm text-gray-900">
                      {donation.serviceDetails}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
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

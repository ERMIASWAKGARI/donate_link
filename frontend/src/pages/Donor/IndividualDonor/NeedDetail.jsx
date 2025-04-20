import { useState } from "react";
import NeedInformation from "./NeedInformation";
import MapComponent from "./MapComponent";
import DonationForm from "./DonationForm";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

const NeedDetail = ({ need, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

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
          alert("Could not get your current location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{need.title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-black flex items-center">
              <FaMapMarkerAlt className="mr-1" />{" "}
              {need.beneficiaryInfo?.location?.address ||
                "Location not specified"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                need.status === "Fulfilled"
                  ? "bg-green-100 text-green-800"
                  : need.status === "Expired"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <IoMdTime className="mr-1" /> {need.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                need.urgencyLevel === "High"
                  ? "bg-red-100 text-red-800"
                  : need.urgencyLevel === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {need.urgencyLevel} Priority
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Need Information */}
            <div className="lg:col-span-2 space-y-6">
              <NeedInformation need={need} />

              {/* Map Component */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-primary" />
                    Location
                  </h3>
                  <button
                    onClick={getCurrentLocation}
                    className="text-sm bg-primary-button text-gray-800 px-3 py-1 rounded hover:bg-yellow-300 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                  {/* <MapComponent
                    location={need.beneficiaryInfo.location}
                    currentLocation={currentLocation}
                  /> */}
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Map preview would be displayed here
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Donation Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <DonationForm
                  need={need}
                  onSubmit={(formData) => {
                    console.log("Donation submitted:", formData);
                    // Handle donation submission here
                  }}
                  onClose={onClose}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedDetail;

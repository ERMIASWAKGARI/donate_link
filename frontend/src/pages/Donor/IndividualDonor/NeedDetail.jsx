import { useState } from "react";
import NeedInformation from "./NeedInformation";
import MapComponent from "./MapComponent";
import DonationForm from "./DonationForm";

const NeedDetail = ({ need, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  // Get current location for directions
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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{need.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Left Column - Need Information */}
            <div className="lg:col-span-2">
              <NeedInformation need={need} />

              {/* Map Component */}
              {/* <div className="mt-6">
                <MapComponent
                  location={need.beneficiaryInfo.location}
                  currentLocation={currentLocation}
                  onGetDirections={getCurrentLocation}
                />
              </div> */}
            </div>

            {/* Right Column - Donation Form */}
            <div className="lg:col-span-1">
              <DonationForm
                need={need}
                onSubmit={(formData) => {
                  console.log("Donation submitted:", formData);
                  // Handle donation submission here
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedDetail;

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchMap from "./SearchMap";

// Fix for default marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
});

const UpdateMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

UpdateMapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const MapClickHandler = ({ setMarkerPosition, setShowLocationCard }) => {
  useMapEvents({
    dblclick(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      setShowLocationCard(true);
    },
  });
  return null;
};

MapClickHandler.propTypes = {
  setMarkerPosition: PropTypes.func.isRequired,
  setShowLocationCard: PropTypes.func.isRequired,
};

const LocationMap = ({ setFormData, mapCenter, setMapCenter }) => {
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [showLocationCard, setShowLocationCard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Get user's current location on component mount
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPosition = [latitude, longitude];
            setMarkerPosition(newPosition);
            setMapCenter(newPosition);
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: [longitude, latitude],
              },
            }));
            setIsLocating(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError(
              "Could not get your location. Please enable location services or select manually."
            );
            setIsLocating(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser");
      }
    };

    getCurrentLocation();
  }, [setFormData, setMapCenter]);

  // Update marker position when mapCenter changes from parent
  useEffect(() => {
    setMarkerPosition(mapCenter);
  }, [mapCenter]);

  const handleConfirmLocation = () => {
    // Convert back to [longitude, latitude] for the form data
    const [latitude, longitude] = markerPosition;
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // [longitude, latitude]
      },
    }));
    setMapCenter([longitude, latitude]);
    setShowLocationCard(false);
  };

  const handleCancelLocation = () => {
    setShowLocationCard(false);
  };

  return (
    <div className="w-full">
      {isLocating && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please enable location access to automatically detect your
                current position. Otherwise you will need to manually select
                your location on the map.
              </p>
              <div>{locationError && <p>Error: {locationError}</p>}</div>
            </div>
          </div>
        </div>
      )}
      <SearchMap
        setMarkerPosition={setMarkerPosition}
        setFormData={setFormData}
        setMapCenter={setMapCenter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="relative w-full pb-4 h-[500px] z-0">
        {" "}
        {/* Increased height */}
        <MapContainer
          center={markerPosition}
          zoom={13}
          className="h-full w-full rounded-md"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={markerPosition}>
            <Tooltip direction="top" offset={[0, -10]} permanent={false}>
              Double-click to select this location
            </Tooltip>
          </Marker>
          <MapClickHandler
            setMarkerPosition={setMarkerPosition}
            setShowLocationCard={setShowLocationCard}
          />
          <UpdateMapView center={markerPosition} />
        </MapContainer>
        {showLocationCard && (
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-white p-4 rounded-lg shadow-lg w-72">
              <h3 className="text-lg font-semibold mb-4">Selected Location</h3>
              <p className="mb-2">
                <span className="font-medium">Latitude:</span>{" "}
                {markerPosition[0].toFixed(4)}
              </p>
              <p className="mb-4">
                <span className="font-medium">Longitude:</span>{" "}
                {markerPosition[1].toFixed(4)}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelLocation}
                  className="bg-gray-400 px-4 py-2 rounded text-white hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

LocationMap.propTypes = {
  setFormData: PropTypes.func.isRequired,
  mapCenter: PropTypes.arrayOf(PropTypes.number).isRequired,
  setMapCenter: PropTypes.func.isRequired,
};

export default LocationMap;

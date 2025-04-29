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
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

  // Convert between [longitude, latitude] and [latitude, longitude]
  const toLeafletCoords = (coords) => [coords[1], coords[0]];
  const fromLeafletCoords = (coords) => [coords[1], coords[0]];

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
            setMapCenter([longitude, latitude]);
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
        setLocationError("Geolography is not supported by your browser");
      }
    };

    getCurrentLocation();
  }, [setFormData, setMapCenter]);

  // Update marker position when mapCenter changes from parent
  useEffect(() => {
    setMarkerPosition(toLeafletCoords(mapCenter));
  }, [mapCenter]);

  const handleConfirmLocation = () => {
    const newCoords = fromLeafletCoords(markerPosition);
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: newCoords,
      },
    }));
    setMapCenter(newCoords);
    setShowLocationCard(false);
  };

  const handleCancelLocation = () => {
    setShowLocationCard(false);
    setMarkerPosition(toLeafletCoords(mapCenter));
  };

  return (
    <div className="w-full space-y-1">
      {isLocating && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Locating your position
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Please enable location access to automatically detect your
                  current position. Otherwise you will need to manually select
                  your location on the map.
                  {locationError && (
                    <span className="block mt-1 text-red-600">
                      Error: {locationError}
                    </span>
                  )}
                </p>
              </div>
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

      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer
          center={markerPosition}
          zoom={13}
          className="h-full w-full"
          style={{ borderRadius: "0.5rem", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={markerPosition}>
            <Tooltip
              direction="top"
              offset={[0, -10]}
              permanent={false}
              className="!bg-white !text-gray-800 !border !border-gray-200 !shadow-sm !rounded-md !px-2 !py-1 !text-sm"
            >
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
            <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-72">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Confirm Location
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Latitude:
                  </span>
                  <span className="text-sm font-mono text-gray-800">
                    {markerPosition[0].toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Longitude:
                  </span>
                  <span className="text-sm font-mono text-gray-800">
                    {markerPosition[1].toFixed(6)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelLocation}
                  className="px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
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

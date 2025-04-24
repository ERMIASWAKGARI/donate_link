import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationMarker = ({ position, setPosition, setShowConfirmation }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setShowConfirmation(true);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

const MaterialDonationForm = ({
  materials,
  location,
  onMaterialChange,
  onLocationChange,
  handleFileUpload,
  removePicture,
  formData,
}) => {
  const [mapPosition, setMapPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mapRef = useRef(null);
  const [address, setAddress] = useState(location?.address || "");

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setMapPosition({ lat: location.latitude, lng: location.longitude });
    }
  }, [location]);

  const handleMapSelection = (latlng) => {
    if (!latlng) return;

    const position = {
      lat: typeof latlng.lat === "function" ? latlng.lat() : latlng.lat,
      lng: typeof latlng.lng === "function" ? latlng.lng() : latlng.lng,
    };

    setMapPosition(position);

    // Reverse geocode to get address (simplified example - in production use a geocoding service)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
    )
      .then((response) => response.json())
      .then((data) => {
        const displayName = data.display_name || "Selected Location";
        setAddress(displayName);
        onLocationChange({
          latitude: position.lat,
          longitude: position.lng,
          address: displayName,
        });
      })
      .catch(() => {
        setAddress("Selected Location");
        onLocationChange({
          latitude: position.lat,
          longitude: position.lng,
          address: "Selected Location",
        });
      });
  };

  const confirmLocation = () => {
    setShowConfirmation(false);
    setShowMap(false);
  };

  const cancelLocation = () => {
    setMapPosition(null);
    setShowConfirmation(false);
    setAddress("");
    onLocationChange({
      latitude: null,
      longitude: null,
      address: "",
    });
  };

  return (
    <>
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Material Items</h4>
        <div className="space-y-3">
          {materials.map((item, index) => (
            <div key={index} className="border p-3 rounded">
              <p className="font-medium">
                {item.categoryName} - {item.subCategoryName}
              </p>
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => onMaterialChange(index, e)}
                  min="1"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Picture Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Upload Pictures (Max 10)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
        />
        {formData.pictures.length > 0 && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {formData.pictures.map((pic, index) => (
              <div key={index} className="relative">
                <img
                  src={pic}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePicture(index)}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-bl px-2"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Pickup/Drop-off Location
        </label>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="bg-[#008080] text-white px-3 py-1 rounded text-sm"
          >
            {mapPosition ? "Change Location" : "Select on Map"}
          </button>

          {navigator.geolocation && (
            <button
              type="button"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const latlng = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    handleMapSelection(latlng);
                  },
                  (error) => {
                    console.error("Error getting location:", error);
                  }
                );
              }}
              className="border border-[#008080] hover:bg-[#008080] hover:text-white px-3 py-1 rounded text-sm"
            >
              Use Current Location
            </button>
          )}
        </div>

        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onLocationChange({
              ...location,
              address: e.target.value,
            });
          }}
          className="w-full p-2 border rounded"
          placeholder="Enter the address or select on map"
          required
        />

        {mapPosition && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Latitude: {mapPosition.lat?.toFixed(5) || location?.latitude}</p>
            <p>
              Longitude: {mapPosition.lng?.toFixed(5) || location?.longitude}
            </p>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0  z-2000 bg-black bg-opacity-50 flex items-center justify-center  p-4">
          <div className="bg-white  rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Select Location on Map</h3>
              <p className="text-sm text-gray-600">
                Click on the map to choose your location
              </p>
            </div>

            <div className="h-96 w-full z-2000 relative">
              <MapContainer
                center={[9.145, 40.4897]} // Center on Ethiopia
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker
                  position={mapPosition}
                  setPosition={handleMapSelection}
                  setShowConfirmation={setShowConfirmation}
                />
              </MapContainer>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMap(false);
                  setShowConfirmation(false);
                }}
                className="px-4 py-2 text-gray-700 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Confirm Location</h3>
            <p className="mb-4">You&apos;ve selected this location:</p>
            <p className="font-medium mb-1">{address}</p>
            <p className="text-sm text-gray-600">
              Lat: {mapPosition?.lat?.toFixed(5) || ""}, Lng:{" "}
              {mapPosition?.lng?.toFixed(5) || ""}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelLocation}
                className="px-4 py-2 text-gray-700 border rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialDonationForm;

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({
  location,
  currentLocation,
  loadingLocation,
  onGetDirections,
}) => {
  const position = [location.latitude, location.longitude];

  const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const getDirectionsUrl = () => {
    if (!currentLocation) return "#";
    return `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${location.latitude},${location.longitude}&travelmode=driving`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Location</h3>
        {currentLocation ? (
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Open Directions
          </a>
        ) : (
          <button
            onClick={onGetDirections}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
          >
            {loadingLocation ? (
              <span className="animate-spin mr-2 w-4 h-4 border-t-2 border-white rounded-full" />
            ) : null}
            Get My Location
          </button>
        )}
      </div>

      <div className="h-64 w-full">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{location.address}</p>
                <p className="text-gray-600">
                  Lat: {location.latitude.toFixed(4)}, Lng:{" "}
                  {location.longitude.toFixed(4)}
                </p>
                {currentLocation && (
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;

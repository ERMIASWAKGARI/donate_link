import L from "leaflet";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
export const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const MapClickHandler = ({ onClick, onDoubleClick }) => {
  useMapEvents({
    click(e) {
      onClick(e);
    },
    dblclick(e) {
      onDoubleClick(e);
    },
  });
  return null;
};

const LocationMarker = ({ setUserLocation }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({
      setView: true,
      maxZoom: 16,
      timeout: 10000,
      enableHighAccuracy: true,
    });

    map.on("locationfound", (e) => {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, 13);
    });

    map.on("locationerror", (e) => {
      console.error("Location access denied or failed:", e.message);
      // Default to some coordinates if location access is denied
      const defaultLocation = L.latLng(9.145, 40.4897); // Default to Ethiopia coordinates
      setUserLocation(defaultLocation);
      map.flyTo(defaultLocation, 6);
    });

    return () => {
      map.off("locationfound");
      map.off("locationerror");
    };
  }, [map, setUserLocation]);

  return null;
};

const MapComponent = ({
  center,
  onLocationSelect,
  onClose,
  selectedLocation,
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  return (
    <div className="relative h-64 w-full mb-4 border rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 z-[1000] bg-white p-1 rounded shadow">
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          Close Map
        </button>
      </div>
      {locationError && (
        <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 p-2 rounded shadow text-sm">
          {locationError}
        </div>
      )}
      <MapContainer
        center={userLocation || center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        doubleClickZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker setUserLocation={setUserLocation} />
        {selectedLocation && (
          <Marker position={selectedLocation} icon={defaultIcon}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}
        {userLocation && (
          <Marker position={userLocation} icon={defaultIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        <MapClickHandler
          onClick={onLocationSelect}
          onDoubleClick={(e) => {
            onLocationSelect(e);
            onClose();
          }}
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

// components/MapLocation.js
import { useEffect } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapLocation = ({ latitude, longitude }) => {
  useEffect(() => {
    // Initialize the map
    const map = L.map("map-container").setView([latitude, longitude], 15);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add marker
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("Beneficiary Location")
      .openPopup();

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className="h-64 rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div id="map-container" className="h-full w-full" />
    </div>
  );
};

MapLocation.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
};

export default MapLocation;

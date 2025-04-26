import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaMapMarkerAlt, FaDirections } from "react-icons/fa";

const Map = ({ latitude, longitude }) => {
  const [position, setPosition] = useState([latitude, longitude]);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      setError(null);
    } else {
      setError("Invalid coordinates provided.");
    }
  }, [latitude, longitude]);

  const markerIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const handleGetDirections = () => {
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setError(null);
          setIsLoading(false);

          // Open directions after getting location
          const destination = `${position[0]},${position[1]}`;
          const origin = `${latitude},${longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
          window.open(url, "_blank");
        },
        (err) => {
          setError("You need to allow location access to get directions.");
          setIsLoading(false);
        },
        { timeout: 10000 } // 10 seconds timeout
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {error && (
        <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>
          {error}
        </p>
      )}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={markerIcon}>
          <Popup>
            <div>
              <FaMapMarkerAlt style={{ marginRight: "5px" }} />
              Destination: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          </Popup>
        </Marker>
        {userLocation && (
          <Marker position={userLocation} icon={markerIcon}>
            <Popup>
              <div>
                <FaMapMarkerAlt style={{ marginRight: "5px" }} />
                Your Location: {userLocation[0].toFixed(6)},{" "}
                {userLocation[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "15px",
        }}
      >
        <button
          onClick={handleGetDirections}
          style={{
            padding: "8px 16px",
            backgroundColor: "#008080",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              <FaDirections style={{ marginRight: "5px" }} />
              Get Directions
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Map;

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
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

const MapComponent = ({
  center,
  onLocationSelect,
  onClose,
  selectedLocation,
}) => {
  return (
    <div className="relative h-64 w-full mb-4 border rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 z-[1000] bg-white p-1 rounded shadow">
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          Close Map
        </button>
      </div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        doubleClickZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedLocation && (
          <Marker position={selectedLocation} icon={defaultIcon} />
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

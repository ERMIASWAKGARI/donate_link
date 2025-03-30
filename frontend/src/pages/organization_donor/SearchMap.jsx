import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaSearch, FaTimes } from "react-icons/fa";

const geocodeLocation = async (query) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`
  );
  const data = await response.json();
  return data.map((item) => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
};

const SearchMap = ({
  setMarkerPosition,
  setFormData,
  setMapCenter,
  searchQuery,
  setSearchQuery,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const locations = await geocodeLocation(searchQuery);
    setSuggestions(locations);
    setIsDropdownOpen(true);
  };

  const handleSuggestionClick = (location) => {
    setMarkerPosition([location.lat, location.lng]);
    setMapCenter([location.lat, location.lng]);
    setSearchQuery(location.name);
    setSuggestions([]);
    setIsDropdownOpen(false);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [location.lng, location.lat], // [longitude, latitude]
      },
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (searchQuery) {
      const fetchSuggestions = async () => {
        const locations = await geocodeLocation(searchQuery);
        setSuggestions(locations);
        setIsDropdownOpen(true);
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative pb-1">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-600 pl-10 pr-10"
          />
          <button
            type="submit"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition"
            aria-label="Search location"
          >
            <FaSearch className="w-5 h-5" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition"
              aria-label="Clear search"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
      {isDropdownOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1"
        >
          {suggestions.map((location) => (
            <button
              key={`${location.lat}-${location.lng}`}
              type="button"
              onClick={() => handleSuggestionClick(location)}
              className="w-full text-left p-2 hover:bg-red-500 hover:text-white cursor-pointer"
            >
              {location.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

SearchMap.propTypes = {
  setMarkerPosition: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  setMapCenter: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
};

export default SearchMap;

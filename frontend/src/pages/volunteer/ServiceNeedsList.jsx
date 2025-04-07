import { useState, useEffect } from "react";
import axios from "axios";
import ChatModal from "../../components/ChatModal";
import {
  FaSearch,
  FaSpinner,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaGlobe,
  FaInfoCircle,
  FaBuilding,
  FaTimes,
} from "react-icons/fa";
import NGOProfileBadge from "./NGOProfileBadge";
import NeedDetailsModal from "./NeedDetailsModal";
import NGOProfileModal from "./NGOProfileModal";

const ServiceNeedsList = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    urgency: "",
  });
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    console.log("ChatModal mounted - Current visibility:", showChatModal);
    console.log("DOM check:", document.querySelector(".ChatModal"));

    if (showChatModal) {
      const interval = setInterval(() => {
        const modal = document.querySelector(".ChatModal");
        console.log("Current modal state:", {
          exists: !!modal,
          visible: modal?.offsetParent !== null,
          styles: modal ? window.getComputedStyle(modal) : null,
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showChatModal]);

  // Fetch service needs
  useEffect(() => {
    const fetchServiceNeeds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/donation/services/all",
          {
            params: {
              search: searchTerm,
              status: filters.status,
              urgencyLevel: filters.urgency,
            },
          }
        );
        setNeeds(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch service needs");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceNeeds();
  }, [searchTerm, filters]);

  useEffect(() => {
    console.log("ChatModal visibility changed to:", showChatModal);
  }, [showChatModal]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      urgency: "",
    });
    setSearchTerm("");
  };

  const handleApply = (needId) => {
    console.log("Applying for need:", needId);
    // Add your application logic here
  };

  const handleNGOProfileClick = (ngo) => {
    setSelectedNGO(ngo);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center">
          <FaExclamationCircle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Service Opportunities
        </h1>
        <p className="text-gray-600">
          Find and contribute to service needs in your community
        </p>
      </div> */}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Status Filter */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Expired">Expired</option>
          </select>

          {/* Urgency Filter */}
          <select
            name="urgency"
            value={filters.urgency}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Urgency Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Needs List */}
      {needs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No service needs found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {needs.map((need) => (
            <div
              key={need._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Need Image */}
              {need.beneficiaryInfo?.pictures?.length > 0 && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={`http://localhost:5000/uploads/${need.beneficiaryInfo.pictures[0].replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={need.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedNeed(need)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    aria-label="View details"
                  >
                    <FaInfoCircle />
                  </button>
                </div>
              )}

              <div className="p-6">
                <NGOProfileBadge
                  ngo={need.NGO}
                  onClick={() => handleNGOProfileClick(need.NGO)}
                />

                {/* Need Title and Status */}
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {need.title}
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      need.status === "Open"
                        ? "bg-green-100 text-green-800"
                        : need.status === "Fulfilled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {need.status}
                  </span>
                </div>

                {/* Need Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {need.description}
                </p>

                {/* Quick Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{need.beneficiaryInfo?.location?.address}</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        need.urgencyLevel === "High"
                          ? "bg-red-500"
                          : need.urgencyLevel === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    ></span>
                    <span>{need.urgencyLevel} urgency</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNeed(need)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(need._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Need Details Modal */}
      {selectedNeed && (
        <NeedDetailsModal
          need={selectedNeed}
          onClose={() => setSelectedNeed(null)}
        />
      )}

      {/* NGO Profile Modal */}
      {selectedNGO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedNGO.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedNGO(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full mr-4">
                  <FaBuilding className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-600">{selectedNGO.email}</p>
                  {selectedNGO.phone && (
                    <p className="text-gray-600">{selectedNGO.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <FaGlobe className="text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {selectedNGO.website || "No website provided"}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {selectedNGO.address || "No address provided"}
                  </span>
                </div>
                {selectedNGO.description && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">About</h3>
                    <p className="text-gray-600">{selectedNGO.description}</p>
                  </div>
                )}
              </div>

              <div>
                {/* Profile modal */}
                {/* NGO Profile Modal */}
                {selectedNGO && (
                  <NGOProfileModal
                    ngo={selectedNGO}
                    onClose={() => setSelectedNGO(null)}
                    onMessageClick={() => {
                      setSelectedNGO(null); // Close profile modal
                      setShowChatModal(true); // Open chat modal
                    }}
                  />
                )}

                {/* Chat Modal - Only appears after message click */}
                {showChatModal && (
                  <div className="fixed inset-0 z-[1000]">
                    <ChatModal
                      onClose={() => {
                        console.log("Closing ChatModal");
                        setShowChatModal(false);
                      }}
                      showChatModal={true} // Force true when rendered
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ServiceNeedsList.propTypes = {};

export default ServiceNeedsList;

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  FaSearch,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaFilter,
  FaTimes,
  FaCalendarCheck,
  FaFire,
  FaUsers,
  FaHandHoldingHeart,
} from "react-icons/fa";
import NGOProfileBadge from "./NGOProfileBadge";
import NeedDetailsModal from "./NeedDetailsModal";
import NGOProfileModal from "./NGOProfileModal";
import ChatModal from "../../components/ChatModal";
import DonationPage from "../Donor/IndividualDonor/DonationPage";

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
  const [chatModalReady, setChatModalReady] = useState(false);
  const [showDonations, setShowDonations] = useState(false); // New state for donations page

  // Fetch service needs with combined filters
  const fetchServiceNeeds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/donation/services/all",
        {
          params: {
            search: searchTerm,
            status: filters.status,
            urgency: filters.urgency,
          },
        }
      );
      setNeeds(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch service needs");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.status, filters.urgency]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServiceNeeds();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchServiceNeeds]);

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

  const handleNGOProfileClick = (ngo) => {
    setSelectedNGO(ngo);
  };

  const handleMessageClick = () => {
    setChatModalReady(true);
  };

  const handleDonationClick = () => {
    setShowDonations(true);
  };

  useEffect(() => {
    if (chatModalReady) {
      setShowChatModal(true);
      setChatModalReady(false);
    }
  }, [chatModalReady]);

  // Reusable Filter Select Component
  const FilterSelect = ({ name, value, onChange, options, icon: Icon }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" />
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="hover:bg-[#008080] hover:text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-full"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-2/3"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
            </div>
            <div className="h-10 bg-gray-200 animate-pulse rounded-full mt-6 w-1/2 ml-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );

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

  // Render DonationsPage if showDonations is true
  if (showDonations) {
    return <DonationPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-2 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services by title, description or location..."
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Status Filter */}
          <FilterSelect
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            icon={FaCalendarCheck}
            options={[
              { value: "", label: "All Statuses" },
              { value: "Open", label: "Open" },
              { value: "Fulfilled", label: "Fulfilled" },
              { value: "Expired", label: "Expired" },
              { value: "Closed", label: "Closed" },
            ]}
          />

          {/* Urgency Filter with Donation Button */}
          <div className="flex gap-2">
            <FilterSelect
              name="urgency"
              value={filters.urgency}
              onChange={handleFilterChange}
              icon={FaFire}
              options={[
                { value: "", label: "All Urgency " },
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
            />
            <button
              onClick={handleDonationClick}
              className="border border-gray-300 text-gray-500 px-4 py-3 rounded-lg hover:bg-[#006666] hover:text-white transition-colors flex items-center"
            >
              <FaHandHoldingHeart className="mr-2" />
              Donations
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            <FaFilter className="mr-2" />
            {filters.status || filters.urgency
              ? "Filters applied"
              : "No filters"}
          </div>
          {(filters.status || filters.urgency || searchTerm) && (
            <button
              onClick={resetFilters}
              className="flex items-center text-sm text-[#008080] hover:text-[#006666]"
            >
              <FaTimes className="mr-1" />
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Needs List */}
      {loading ? (
        <SkeletonLoader />
      ) : needs.length === 0 ? (
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
                  ngo={{
                    ...need.NGO,
                    profilePicture: need.NGO?.profilePicture,
                  }}
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
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span className="truncate max-w-[120px]">
                      {need.beneficiaryInfo?.location?.address}
                    </span>
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
                    <span>{need.urgencyLevel}</span>
                  </div>
                </div>

                {/* Beneficiary Count */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <FaUsers className="mr-2 text-gray-400" />
                  <span>
                    {need.beneficiaryInfo?.numberOfBeneficiaries || 0}{" "}
                    beneficiaries
                  </span>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedNeed(need)}
                    className="bg-yellow-400 text-[#000] px-6 py-2 rounded-full font-normal hover:bg-yellow-500 transition cursor-pointer shadow-md"
                  >
                    Apply Now
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
        <NGOProfileModal
          ngo={selectedNGO}
          onClose={() => setSelectedNGO(null)}
          onMessageClick={handleMessageClick}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          onClose={() => setShowChatModal(false)}
          showChatModal={true}
        />
      )}
    </div>
  );
};

ServiceNeedsList.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default ServiceNeedsList;

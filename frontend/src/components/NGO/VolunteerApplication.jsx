import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import Profile from "../../pages/Profile";
import ChatModal from "../ChatModal";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal";

function VolunteerApplication() {
  const [loading, setLoading] = useState(true);
  const [serviceNeeds, setServiceNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState("");
  const [currentVolunteerId, setCurrentVolunteerId] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleViewProfile = async (volunteer) => {
    try {
      setProfileLoading(true);
      setSelectedVolunteer(volunteer);
      const response = await axiosInstance.get(
        `/users/${volunteer.applicant._id}`
      );
      setVolunteerDetails(response.data.data);
      setShowProfileModal(true);
      setOpenDropdownId(null); // Close dropdown when opening profile
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const getServiceNeeds = async () => {
      try {
        const response = await axiosInstance.get("donation/services");
        if (response.data.success) {
          setServiceNeeds(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching service needs:", error);
      } finally {
        setLoading(false);
      }
    };
    getServiceNeeds();
  }, []);

  const getApplications = async (need) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`donation/service/${need}`);
      setVolunteers(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNeedChange = (event) => {
    const needId = event.target.value;
    setSelectedNeed(needId);
    if (needId) getApplications(needId);
  };

  const confirmAction = (type, volunteerId) => {
    setActionType(type);
    setCurrentVolunteerId(volunteerId);
    setShowConfirmation(true);
    setOpenDropdownId(null); // Close dropdown when confirming action
  };

  const handleApplicationStatus = async (confirmed) => {
    if (!confirmed) {
      setShowConfirmation(false);
      return;
    }

    try {
      const response = await axiosInstance.put(
        `donation/service/${currentVolunteerId}`,
        { status: actionType }
      );
      if (response.data.success && selectedNeed) {
        getApplications(selectedNeed);
      }
    } catch (error) {
      console.error(`Error updating volunteer status to ${actionType}:`, error);
    } finally {
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Volunteer Management
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Review and manage volunteer applications for your NGO
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-gray-100">
          <div className="mb-6">
            <label
              htmlFor="service-need"
              className="block text-lg font-medium text-gray-700 mb-3"
            >
              Select Service Need
            </label>
            <div className="relative">
              <select
                id="service-need"
                value={selectedNeed}
                onChange={handleNeedChange}
                className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl"
              >
                <option value="">-- Select a service need --</option>
                {serviceNeeds.map((need) => (
                  <option key={need._id} value={need._id}>
                    {need.title} ({need.urgencyLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedNeed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                Volunteer Applications
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <svg
                  className="-ml-1 mr-1.5 h-2 w-2 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {volunteers.length}{" "}
                {volunteers.length === 1 ? "application" : "applications"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : volunteers.length > 0 ? (
              <div className="space-y-6">
                {volunteers.map((volunteer) => (
                  <motion.div
                    key={volunteer._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 relative"
                  >
                    {/* Action Dropdown Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleDropdown(volunteer._id)}
                        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === volunteer._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleViewProfile(volunteer)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setShowChatModal(true);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Contact
                          </button>
                          <button
                            onClick={() =>
                              confirmAction("accepted", volunteer._id)
                            }
                            className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              confirmAction("rejected", volunteer._id)
                            }
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-shrink-0">
                            {volunteer?.applicant?.profilePicture ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover"
                                src={volunteer.donorId.profilePicture}
                                alt={volunteer.donorId.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {volunteer?.applicant?.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {volunteer.applicant.name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {volunteer.status || "pending"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-gray-600 italic">
                            {volunteer.message || "No message provided"}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Service
                              </h4>
                              <p className="mt-1 font-medium">
                                {volunteer.categoryName} •{" "}
                                {volunteer.subCategoryName}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Duration
                              </h4>
                              <p className="mt-1 font-medium">
                                {new Date(
                                  volunteer.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  volunteer.endDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Commitment
                              </h4>
                              <p className="mt-1 font-medium">
                                {volunteer.hoursPerWeek} hours/week
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-5 text-xl font-medium text-gray-900">
                  No applications yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Volunteers haven&apos;t applied to this need yet. Check back
                  later.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm z-40"
              onClick={() => {
                setShowProfileModal(false);
                setVolunteerDetails(null);
              }}
            />
          </AnimatePresence>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">
                  Volunteer Profile
                </h3>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setVolunteerDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {profileLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : volunteerDetails ? (
                  <Profile
                    user={volunteerDetails}
                    volunteerApplication={selectedVolunteer}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Failed to load profile details
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && (
          <ChatModal
            onClose={() => setShowChatModal(false)}
            showChatModal={showChatModal}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setActionType("");
            setCurrentVolunteerId("");
          }}
          onConfirm={handleApplicationStatus}
          actionType={actionType}
        />
      </motion.div>
    </div>
  );
}

export default VolunteerApplication;

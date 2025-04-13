import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useUser } from "../../context/UserContext";
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
  const { user } = useUser();
  const ngoId = user._id;
  const [profileLoading, setProfileLoading] = useState(false);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState("");
  const [currentVolunteerId, setCurrentVolunteerId] = useState("");

  const handleViewProfile = async (volunteer) => {
    try {
      setProfileLoading(true);
      setSelectedVolunteer(volunteer);
      const response = await axiosInstance.get(
        `/users/${volunteer.donorId._id}`
      );
      setVolunteerDetails(response.data.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchServiceNeeds = async () => {
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
    fetchServiceNeeds();
  }, []);

  const fetchVolunteers = async (needId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `donation/service/${ngoId}/${needId}`
      );
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
    if (needId) fetchVolunteers(needId);
  };

  const confirmAction = (type, volunteerId) => {
    setActionType(type);
    setCurrentVolunteerId(volunteerId);
    setShowConfirmation(true);
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
        fetchVolunteers(selectedNeed);
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

        {/* Service Need Selection */}
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Volunteers List */}
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
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-shrink-0">
                            {volunteer.donorId.profilePicture ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover"
                                src={volunteer.donorId.profilePicture}
                                alt={volunteer.donorId.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {volunteer.donorId.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {volunteer.donorId.name}
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
                                {volunteer.services[0].categoryName} •{" "}
                                {volunteer.services[0].subCategoryName}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Duration
                              </h4>
                              <p className="mt-1 font-medium">
                                {new Date(
                                  volunteer.services[0].startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  volunteer.services[0].endDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Commitment
                              </h4>
                              <p className="mt-1 font-medium">
                                {volunteer.services[0].hoursPerWeek} hours/week
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 min-w-[200px]">
                        <button
                          onClick={() => handleViewProfile(volunteer)}
                          className="group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          View Profile
                        </button>
                        <button
                          onClick={() => setShowChatModal(true)}
                          className="group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                        >
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Contact
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              confirmAction("accepted", volunteer._id)
                            }
                            className="group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                          >
                            <svg
                              className="-ml-1 mr-2 h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              confirmAction("rejected", volunteer._id)
                            }
                            className="group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                          >
                            <svg
                              className="-ml-1 mr-2 h-5 w-5"
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
                            Reject
                          </button>
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
      </motion.div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"
              onClick={() => {
                setShowProfileModal(false);
                setVolunteerDetails(null);
              }}
            />

            {/* Modal content */}
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 relative z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
                  <h3
                    className="text-2xl font-bold text-gray-900"
                    id="modal-headline"
                  >
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
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

export default VolunteerApplication;

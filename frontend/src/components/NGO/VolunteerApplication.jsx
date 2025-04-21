import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import Profile from "../../pages/Profile";
import ChatModal from "../ChatModal";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal";
import { Eye } from "lucide-react";
import VolunteerCard from "./VolunteerCard";

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
      setOpenDropdownId(null);
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
    setOpenDropdownId(null);
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

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const handleCloseDetails = () => {
    setSelectedVolunteer(null);
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl sm:tracking-tight lg:text-2xl">
            Volunteer Management
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Review and manage volunteer applications for your NGO
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-gray-100">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {volunteer.applicant.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {volunteer.status}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(volunteer)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
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

        {selectedVolunteer && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75  z-40"
              onClick={handleCloseDetails}
            />
          </AnimatePresence>
        )}
        {selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-2xl w-full rounded-xl overflow-y-auto max-h-[90vh] p-6 relative shadow-lg"
            >
              <button
                onClick={handleCloseDetails}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <VolunteerCard
                volunteer={selectedVolunteer}
                handleViewProfile={handleViewProfile}
                toggleDropdown={toggleDropdown}
                openDropdownId={openDropdownId}
                confirmAction={confirmAction}
                setShowChatModal={setShowChatModal}
                setOpenDropdownId={setOpenDropdownId}
              />
            </motion.div>
          </div>
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

import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import Profile from "../../pages/Profile";
import ChatModal from "../ChatModal";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal";
import { Users, Frown, ChevronLeft, ChevronRight } from "lucide-react";
import VolunteerCard from "./VolunteerCard";
import { Spin } from "antd";
import VolunteersList from "./VolunteersList";

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
  const [isFetchingNeeds, setIsFetchingNeeds] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });
  const [, setStatus] = useState("");
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getServiceNeeds(newPage);
    }
  };
  const updateVolunteerStatus = (volunteerId, newStatus) => {
    setVolunteers((prevVolunteers) =>
      prevVolunteers.map((volunteer) =>
        volunteer._id === volunteerId
          ? { ...volunteer, status: newStatus }
          : volunteer
      )
    );
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

  const getServiceNeeds = async (page = 1) => {
    try {
      setIsFetchingNeeds(true);
      const response = await axiosInstance.get("donation/services", {
        params: {
          page,
          limit: pagination.itemsPerPage,
        },
      });
      if (response.data.success) {
        setServiceNeeds(response.data.data);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.data.length,
            itemsPerPage: 5,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching service needs:", error);
    } finally {
      setIsFetchingNeeds(false);
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // Optimistic update already done via updateVolunteerStatus
      await axiosInstance.put(`donation/service/${currentVolunteerId}`, {
        status: actionType,
      });

      // Only refresh if absolutely necessary
      if (selectedNeed) {
        setTimeout(() => getApplications(selectedNeed), 1000); // Small delay
      }
    } catch (error) {
      console.error(`Error updating status:`, error);
      // Revert optimistic update
      updateVolunteerStatus(
        currentVolunteerId,
        volunteers.find((v) => v._id === currentVolunteerId).status
      );
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
  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-full">
        <Spin size="large" />
      </div>
    );
  }
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Volunteer Management
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-lg text-gray-600">
            Review and manage volunteer applications for your NGO
          </p>
        </div>

        {/* Service Needs Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label
                htmlFor="service-need"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Select Service Need
              </label>
              <p className="text-sm text-gray-500">
                Choose a need to view volunteer applications
              </p>
            </div>
            <div className="w-full sm:w-96">
              {isFetchingNeeds ? (
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              ) : serviceNeeds.length > 0 ? (
                <>
                  <select
                    id="service-need"
                    value={selectedNeed}
                    onChange={handleNeedChange}
                    className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 rounded-lg mb-2"
                  >
                    <option value="">-- Select a service need --</option>
                    {serviceNeeds.map((need) => (
                      <option key={need._id} value={need._id}>
                        {need.title} ({need.urgencyLevel})
                      </option>
                    ))}
                  </select>
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className={`flex items-center px-3 py-1 rounded ${
                          pagination.currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className={`flex items-center px-3 py-1 rounded ${
                          pagination.currentPage === pagination.totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex flex-col items-center">
                    <Frown className="w-8 h-8 text-yellow-600 mb-2" />
                    <h3 className="font-medium text-yellow-800">
                      No Service Needs Found
                    </h3>
                    <p className="text-sm text-yellow-600 mt-1">
                      Create service needs to receive volunteer applications
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Volunteer Applications Section */}
        {selectedNeed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Volunteer Applications
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Review and manage applications for this need
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                <Users className="w-4 h-4 mr-1.5" />
                {volunteers.length}{" "}
                {volunteers.length === 1 ? "application" : "applications"}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                <p className="text-gray-500">Loading applications...</p>
              </div>
            ) : volunteers.length > 0 ? (
              <div className="space-y-4">
                {volunteers.map((volunteer, index) => (
                  <VolunteersList
                    key={index}
                    volunteer={volunteer}
                    volunteers={volunteers}
                    handleViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No applications yet
                </h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Volunteers haven&apos;t applied to this need yet. Try sharing
                  the need to attract more volunteers.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Service Need
              </h3>
              <p className="text-gray-600 mb-6">
                Choose a service need from the dropdown above to view volunteer
                applications.
              </p>
              {serviceNeeds.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-700">
                    You haven&apos;t created any service needs yet. Create one
                    to start receiving volunteer applications.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Volunteer Detail Modal */}
        {selectedVolunteer && (
          <>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
                onClick={handleCloseDetails}
              />
            </AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white max-w-3xl w-full rounded-xl overflow-y-auto max-h-[90vh] p-6 relative shadow-lg"
              >
                <button
                  onClick={handleCloseDetails}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close"
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
                  updateVolunteerStatus={updateVolunteerStatus}
                />
              </motion.div>
            </div>
          </>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              >
                <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">
                    Volunteer Profile
                  </h3>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      setVolunteerDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition"
                    aria-label="Close profile"
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
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
          </>
        )}

        {/* Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <ChatModal
              onClose={() => setShowChatModal(false)}
              showChatModal={showChatModal}
            />
          </div>
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

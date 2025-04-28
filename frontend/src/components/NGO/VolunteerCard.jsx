import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const VolunteerCard = ({
  volunteer,
  handleViewProfile,
  setShowChatModal,
  confirmAction,
  updateVolunteerStatus, // Add this new prop
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(volunteer.status); // Local status state

  const handleAction = async (action, volunteerId) => {
    setIsProcessing(true);
    setActionType(action);
    try {
      // Optimistically update the UI
      setCurrentStatus(action);

      // Call the confirmAction which should make the API call
      await confirmAction(action, volunteerId);

      // If you want to be extra safe, you can call updateVolunteerStatus
      // to sync with the server response
      if (updateVolunteerStatus) {
        updateVolunteerStatus(volunteerId, action);
      }
    } catch (error) {
      // Revert if there was an error
      setCurrentStatus(volunteer.status);
      console.error("Error updating volunteer status:", error);
    } finally {
      setIsProcessing(false);
      setActionType(null);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <motion.div
        key={volunteer._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 relative ${
          isProcessing ? "opacity-70" : ""
        }`}
      >
        {/* Blur overlay during processing */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Action Dropdown Button - Only show for pending applications */}

        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isProcessing}
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
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30"
              >
                <button
                  onClick={() => {
                    handleViewProfile(volunteer);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setShowChatModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={() => handleAction("accepted", volunteer._id)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    actionType === "accepted" && isProcessing
                      ? "text-green-400"
                      : "text-green-600 hover:bg-green-50"
                  } transition-colors`}
                  disabled={isProcessing}
                >
                  {actionType === "accepted" && isProcessing ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Accepting...
                    </span>
                  ) : (
                    "Accept"
                  )}
                </button>
                <button
                  onClick={() => handleAction("rejected", volunteer._id)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    actionType === "rejected" && isProcessing
                      ? "text-red-400"
                      : "text-red-600 hover:bg-red-50"
                  } transition-colors`}
                  disabled={isProcessing}
                >
                  {actionType === "rejected" && isProcessing ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Rejecting...
                    </span>
                  ) : (
                    "Reject"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0">
                {volunteer?.applicant?.profilePicture ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={volunteer.applicant.profilePicture}
                    alt={volunteer.applicant.name}
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
                <p
                  className={`text-sm px-2 py-0.5 rounded-full inline-block ${
                    currentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : currentStatus === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  } capitalize`}
                >
                  {currentStatus || "pending"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-medium text-gray-700">Motivation</h3>
                <p className="text-gray-600 italic">
                  {volunteer.motivation || "No message provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service
                  </h4>
                  <p className="mt-1 font-medium">
                    {volunteer.category} • {volunteer.subCategory}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duration
                  </h4>
                  <p className="mt-1 font-medium">
                    {new Date(volunteer.startDate).toLocaleDateString()} -{" "}
                    {new Date(volunteer.endDate).toLocaleDateString()}
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
    </div>
  );
};

export default VolunteerCard;

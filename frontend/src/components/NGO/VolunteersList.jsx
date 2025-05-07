import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  MoreVertical,
} from "lucide-react";

const VolunteersList = ({
  volunteer,
  handleViewProfile,
  setShowChatModal,
  confirmAction,
  updateVolunteerStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleAction = async (newStatus, volunteerId) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setActionType(newStatus);

    try {
      if (updateVolunteerStatus) {
        updateVolunteerStatus(volunteerId, newStatus);
      }
      await confirmAction(newStatus, volunteerId);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsProcessing(false);
      setActionType(null);
      setIsDropdownOpen(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      case "Incomplete":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden relative">
      {/* Header row - always visible */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${
          isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          {volunteer?.applicant?.profilePicture ? (
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={volunteer.applicant.profilePicture}
              alt={volunteer.applicant.name}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              {volunteer?.applicant?.name.charAt(0)}
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900">
              {volunteer.applicant.name}
            </h3>
            <p
              className={`text-xs px-2 py-0.5 rounded-full inline-block ${getStatusStyles(
                volunteer.status
              )}`}
            >
              {volunteer.status}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <div className="pt-2 border-t border-gray-100">
              {/* Action buttons positioned below the header */}
              <div className="mb-4 flex justify-end">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    {isProcessing && actionType ? (
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
                        {actionType}...
                      </span>
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleViewProfile(volunteer);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4 mr-2" />
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setShowChatModal(true);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() =>
                              handleAction("Accepted", volunteer._id)
                            }
                            disabled={
                              volunteer.status === "Accepted" ||
                              volunteer.status === "Completed" ||
                              volunteer.status === "Incomplete" ||
                              isProcessing
                            }
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              volunteer.status === "Accepted" ||
                              volunteer.status === "Completed" ||
                              volunteer.status === "Incomplete"
                                ? "text-green-400 cursor-not-allowed"
                                : actionType === "Accepted" && isProcessing
                                ? "text-green-400"
                                : "text-green-600 hover:bg-green-50"
                            } transition-colors`}
                          >
                            {actionType === "Accepted" && isProcessing ? (
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
                            onClick={() =>
                              handleAction("Rejected", volunteer._id)
                            }
                            disabled={
                              volunteer.status === "Rejected" ||
                              volunteer.status === "Accepted" ||
                              volunteer.status === "Completed" ||
                              volunteer.status === "Incomplete" ||
                              isProcessing
                            }
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              volunteer.status === "Rejected" ||
                              volunteer.status === "Accepted" ||
                              volunteer.status === "Completed" ||
                              volunteer.status === "Incomplete"
                                ? "text-red-400 cursor-not-allowed"
                                : actionType === "Rejected" && isProcessing
                                ? "text-red-400"
                                : "text-red-600 hover:bg-red-50"
                            } transition-colors`}
                          >
                            {actionType === "Rejected" && isProcessing ? (
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
                          <button
                            onClick={() =>
                              handleAction("Completed", volunteer._id)
                            }
                            disabled={
                              (volunteer.status !== "Accepted" &&
                                volunteer.status !== "Incomplete") ||
                              isProcessing
                            }
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              volunteer.status === "Completed"
                                ? "text-purple-400 cursor-not-allowed"
                                : actionType === "Completed" && isProcessing
                                ? "text-purple-400"
                                : volunteer.status !== "Accepted" &&
                                  volunteer.status !== "Incomplete"
                                ? "text-purple-300 cursor-not-allowed"
                                : "text-purple-600 hover:bg-purple-50"
                            } transition-colors`}
                          >
                            {actionType === "Completed" && isProcessing ? (
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
                                Completing...
                              </span>
                            ) : (
                              "Mark Complete"
                            )}
                          </button>
                          {/* "Submitted", "Under Review", "Interview Scheduled",
                          "Approved", "Rejected", "On Hold", "Withdrawn",
                          "Accepted", "Incomplete", "Completed", */}
                          <button
                            onClick={() =>
                              handleAction("Incomplete", volunteer._id)
                            }
                            disabled={
                              volunteer.status !== "Accepted" || isProcessing
                            }
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              volunteer.status === "Incomplete"
                                ? "text-orange-400 cursor-not-allowed"
                                : actionType === "Incomplete" && isProcessing
                                ? "text-orange-400"
                                : volunteer.status !== "Accepted"
                                ? "text-orange-300 cursor-not-allowed"
                                : "text-orange-600 hover:bg-orange-50"
                            } transition-colors`}
                          >
                            {actionType === "Incomplete" && isProcessing ? (
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
                                Marking Incomplete...
                              </span>
                            ) : (
                              "Mark Incomplete"
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Motivation
                </h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                  {volunteer.motivation || "No motivation provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Service
                  </h4>
                  <p className="font-medium text-sm">
                    {volunteer.category} • {volunteer.subCategory}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Duration
                  </h4>
                  <p className="font-medium text-sm">
                    {new Date(volunteer.startDate).toLocaleDateString()} -{" "}
                    {new Date(volunteer.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteersList;

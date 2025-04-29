import { FaEye, FaTrash } from "react-icons/fa";
import { useState } from "react";
import axios from "../../config/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

const NeedsList = ({ needs, openDetailsModal, onNeedDeleted }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [needToDelete, setNeedToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (need) => {
    setNeedToDelete(need);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!needToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `/donation/deleteNeed/${needToDelete._id}`
      );

      if (response.data.success) {
        onNeedDeleted(needToDelete._id); // Callback to update parent state
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting need:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {needs.map((need) => (
          <div
            key={need._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative"
          >
            {/* Delete button - only show if no donations */}
            {!need.hasDonations && (
              <button
                onClick={() => handleDeleteClick(need)}
                className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors z-10"
                aria-label="Delete need"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}

            {need.beneficiaryInfo.pictures?.length > 0 && (
              <div className="h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000/uploads/${need.beneficiaryInfo.pictures[0].replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Need"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {need.title || "Untitled Need"}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    need.status === "Fulfilled"
                      ? "bg-green-100 text-green-800"
                      : need.status === "Expired"
                      ? "bg-red-100 text-red-800"
                      : "bg-primary text-white"
                  }`}
                >
                  {need.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {need.description || "No description provided"}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {need.needTypes?.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-medium ${
                    need.urgencyLevel === "High"
                      ? "text-red-500"
                      : need.urgencyLevel === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {need.urgencyLevel}
                </span>
                <button
                  onClick={() => openDetailsModal(need)}
                  className="flex items-center gap-1 text-primary hover:text-opacity-90 text-sm font-medium"
                >
                  View Details <FaEye className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Delete Need
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the need "
                  {needToDelete?.title}"? This action cannot be undone.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NeedsList;

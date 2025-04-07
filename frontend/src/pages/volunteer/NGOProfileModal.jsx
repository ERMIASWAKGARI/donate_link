import PropTypes from "prop-types";
import { useChat } from "../../context/ChatContext";
import { useState } from "react";
import {
  FaTimes,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "framer-motion";

const NGOProfileModal = ({ ngo, onClose, onMessageClick }) => {
  const { startConversation, setActiveConversation } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMessageClick = async () => {
    if (!ngo?._id) return;

    setIsLoading(true);
    try {
      const conversation = await startConversation(ngo._id);
      setActiveConversation(conversation);

      // Open chat modal first
      onMessageClick();

      // Then close this modal after ensuring ChatModal is mounted
      setTimeout(() => {
        onClose();
      }, 100); // Increased delay to ensure render cycle completes
    } catch (error) {
      console.error("Chat error:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  if (!ngo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBuilding className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{ngo.name}</h2>
              <p className="text-gray-600">{ngo.email}</p>
              {ngo.phone && <p className="text-gray-600">{ngo.phone}</p>}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <FaGlobe className="text-gray-400" />
              <span className="text-gray-700">
                {ngo.website || "No website provided"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span className="text-gray-700">
                {ngo.address || "No address provided"}
              </span>
            </div>

            {ngo.description && (
              <div className="pt-2">
                <h3 className="font-semibold text-gray-800 mb-1">About</h3>
                <p className="text-gray-600">{ngo.description}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMessageClick}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white shadow-md`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Starting Chat...</span>
                </>
              ) : (
                <>
                  <FaEnvelope />
                  <span>Message NGO</span>
                </>
              )}
            </motion.button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

NGOProfileModal.propTypes = {
  ngo: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    website: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onMessageClick: PropTypes.func.isRequired,
};

export default NGOProfileModal;

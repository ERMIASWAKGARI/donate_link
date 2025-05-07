/* eslint-disable react/prop-types */
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageSquare, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { headerLinks } from './HeaderConfig';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './../../components/NotificationBell';
import GoogleTranslate from '../../context/GoogleTranslate';
import ChatModal from '../ChatModal';

const DesktopNav = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { unreadCount } = useChat();

  const dropdownRefs = {
    howItWorks: useRef(null),
    donations: useRef(null),
    language: useRef(null),
    profile: useRef(null),
  };

  // Get role-specific links
  const role = user?.role;
  const roleLinks = headerLinks[role] || [];
  const allLinks = [...headerLinks.common, ...roleLinks];

  const dropdownVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeDropdown) return;

      const ref = dropdownRefs[activeDropdown];
      if (ref.current && !ref.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handlePostDonationClick = () => {
    if (user?.isVerified) {
      navigate('/post-donation');
    } else {
      setShowVerificationModal(true);
    }
  };

  return (
    <div className="hidden md:flex space-x-6 items-center">
      {/* Role-specific main navigation items */}
      {role === 'organization_donor' && (
        <>
          <motion.button
            onClick={handlePostDonationClick}
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Post Donation
          </motion.button>

          {/* Verification Required Modal */}
          <AnimatePresence>
            {showVerificationModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                {/* Overlay */}
                <motion.div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                  onClick={() => setShowVerificationModal(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Modal content */}
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-lg"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-red-100 rounded-full mb-4">
                      <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verification Required
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You need to verify your account before posting donations.
                      Please complete your verification process to access this
                      feature.
                    </p>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setShowVerificationModal(false);
                          navigate('/profile?tab=verification');
                        }}
                        className="flex-1 py-2 px-4 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                      >
                        Go to Verification
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {(role === 'ngo' || role === 'volunteer') && (
        <>
          <motion.button
            onClick={() => setShowChatModal(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Chat</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Modern Chat Modal Overlay */}
          <AnimatePresence>
            {showChatModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                {/* Frosted glass overlay */}
                <motion.div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                  onClick={() => setShowChatModal(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Modern floating modal container */}
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-2xl h-[80vh]"
                >
                  <ChatModal
                    onClose={() => setShowChatModal(false)}
                    showChatModal={showChatModal}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {/* Language Dropdown */}
      <GoogleTranslate />

      <div>
        <NotificationBell />
      </div>

      {/* Profile Dropdown */}
      <ProfileDropdown
        user={user}
        handleLogout={handleLogout}
        links={allLinks}
        isOpen={activeDropdown === 'profile'}
        setIsOpen={(isOpen) => setActiveDropdown(isOpen ? 'profile' : null)}
        ref={dropdownRefs.profile}
      />
    </div>
  );
};

export default DesktopNav;

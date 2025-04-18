/* eslint-disable react/prop-types */
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import NotificationBell from './../../components/NotificationBell';
import { headerLinks } from './HeaderConfig';
import ProfileDropdown from './ProfileDropdown';

import ChatModal from '../ChatModal'; // Import the ChatModal component

const DesktopNav = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
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

  return (
    <div className="hidden md:flex space-x-6 items-center">
      {/* How It Works Dropdown */}
      <div className="relative" ref={dropdownRefs.howItWorks}>
        <motion.button
          onClick={() => toggleDropdown('howItWorks')}
          className="flex items-center hover:text-yellow-400 transition"
          whileHover={{ scale: 1.05 }}
        >
          How It Works
          <motion.div
            animate={{ rotate: activeDropdown === 'howItWorks' ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="ml-1" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {activeDropdown === 'howItWorks' && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 mt-2 w-56 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
            >
              {[
                { to: '/donate', text: 'Choose Items to Donate' },
                { to: '/ngos', text: 'Select an NGO' },
                { to: '/impact', text: 'Track Your Impact' },
                { to: '/faq', text: 'FAQs' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 hover:bg-gray-100 transition ${
                        isActive ? 'bg-gray-100 font-medium' : ''
                      }`
                    }
                    onClick={() => setActiveDropdown(null)}
                  >
                    {item.text}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Donations Dropdown */}
      <div className="relative" ref={dropdownRefs.donations}>
        <motion.button
          onClick={() => toggleDropdown('donations')}
          className="flex items-center hover:text-yellow-400 transition"
          whileHover={{ scale: 1.05 }}
        >
          Donations
          <motion.div
            animate={{ rotate: activeDropdown === 'donations' ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="ml-1" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {activeDropdown === 'donations' && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 mt-2 w-56 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
            >
              {[
                { to: '/donate', text: 'Make a Donation' },
                { to: '/causes', text: 'View Causes' },
                { to: '/recurring', text: 'Recurring Donations' },
                { to: '/history', text: 'Donation History' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 hover:bg-gray-100 transition ${
                        isActive ? 'bg-gray-100 font-medium' : ''
                      }`
                    }
                    onClick={() => setActiveDropdown(null)}
                  >
                    {item.text}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role-specific main navigation items */}
      {role === 'organization_donor' && (
        <motion.button
          onClick={() => navigate('/post-donation')}
          className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Post Donation
        </motion.button>
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
      <div className="relative" ref={dropdownRefs.language}>
        <motion.button
          onClick={() => toggleDropdown('language')}
          className="flex items-center hover:text-yellow-400 transition"
          whileHover={{ scale: 1.05 }}
        >
          ENG
          <motion.div
            animate={{ rotate: activeDropdown === 'language' ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="ml-1" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {activeDropdown === 'language' && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 mt-2 w-32 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
            >
              {['English', 'Amaric', 'Afan Oromo'].map((language, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition"
                  >
                    {language}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

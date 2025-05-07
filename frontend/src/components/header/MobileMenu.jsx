/* eslint-disable react/prop-types */
import { useState } from 'react';

import { MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';

import { useChat } from '../../context/ChatContext';
import { icons, headerLinks } from './HeaderConfig';
import { X } from 'lucide-react';

import NotificationBell from './../../components/NotificationBell';
import GoogleTranslate from '../../context/GoogleTranslate';

import ChatModal from '../ChatModal';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2 },
  },
};

const MobileMenu = ({ setMenuOpen, user, handleLogout }) => {
  const navigate = useNavigate();

  const [showChatModal, setShowChatModal] = useState(false);
  const { unreadCount } = useChat();

  const role = user?.role;
  const roleLinks = headerLinks[role] || [];
  const allLinks = [...headerLinks.common, ...roleLinks];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start" // Added items-start here
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
    >
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Menu */}
      <motion.div
        className="ml-auto w-4/5 max-w-xs bg-white shadow-lg relative flex flex-col overflow-y-auto" // Removed max-h-screen
        variants={menuVariants}
      >
        {/* Rest of your menu content remains exactly the same */}
        {/* Close Button */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-yellow-500 bg-[#008080]">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Top-right mobile actions */}
        <div className="flex justify-end items-center gap-3 px-4 py-3 border-b border-yellow-500 bg-[#008080]">
          {/* Post Donation Button (only for organization_donor) */}
          {role === 'organization_donor' && (
            <button
              onClick={() => {
                setMenuOpen(false);
                if (user?.isVerified) {
                  navigate('/post-donation');
                } else {
                  navigate('/profile?tab=verification');
                }
              }}
              className="bg-yellow-400 text-green-900 py-1.5 px-3 rounded-md text-sm font-semibold hover:bg-yellow-500 transition-colors shadow"
            >
              Post Donation
            </button>
          )}

          {/* Chat Button (only for NGO/Volunteer) */}
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
                      transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 300,
                      }}
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

          {/* Google Translate */}
          <div className="translate-scale">
            <GoogleTranslate />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <NotificationBell />
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-yellow-500 bg-gray-50 ">
            <div className="w-10 h-10 rounded-full bg-yellow-400 overflow-hidden flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:5000/uploads/${user.profilePicture}`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <icons.User className="text-[#008080]" size={20} />
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-700">{user.name}</p>
              <p className="text-sm font-semibold text-[#008080] truncate">
                {user.email}
              </p>
              <p className="text-xs font-medium text-[#008080] capitalize">
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Links */}
        <nav className="flex-1 py-2 bg-gray-50">
          {allLinks.map((link, idx) => {
            const Icon = icons[link.icon];
            return (
              <NavLink
                key={idx}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                {Icon && <Icon size={18} className="text-[#008080]" />}
                {link.text}
              </NavLink>
            );
          })}
          {/* Sign Out Button */}
          <div className="py-1 border-t border-yellow-500">
            <motion.div
              whileHover={{ backgroundColor: '#fee2e2' }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <icons.LogOut size={16} className="mr-3" />
                Sign Out
              </button>
            </motion.div>
          </div>
        </nav>
      </motion.div>
    </motion.div>
  );
};

export default MobileMenu;

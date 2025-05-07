/* eslint-disable react/prop-types */
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { icons } from './HeaderConfig';

const ProfileDropdown = forwardRef(
  ({ user, handleLogout, links, isOpen, setIsOpen }, ref) => {
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

    return (
      <div className="relative" ref={ref}>
        <motion.button
          className="flex items-center space-x-2 hover:text-yellow-400 transition"
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden">
            {user && user.profilePicture ? (
              <img
                src={`http://localhost:5000/uploads/${user.profilePicture}`}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <icons.User size={18} className="text-[#008080]" />
            )}
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
            >
              {/* User Info Section */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <p className="text-sm font-medium text-gray-700">
                  {user ? user.name : 'Guest'}
                </p>
                <p className="text-sm font-semibold text-[#008080] truncate">
                  {user ? user.email : 'N/A'}
                </p>
                <p className="text-xs font-medium text-[#008080] capitalize">
                  {user ? user.role.replace('_', ' ') : 'Guest'}
                </p>
              </div>

              {/* Main Links */}
              <div className="py-1">
                {links.map((link, index) => {
                  const IconComponent = icons[link.icon];
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                    >
                      <NavLink
                        to={link.to}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsOpen(false)}
                      >
                        {IconComponent && (
                          <IconComponent
                            size={16}
                            className="mr-3 text-[#008080]"
                          />
                        )}
                        {link.text}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>

              <div className="py-1 border-t border-gray-100">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ProfileDropdown.displayName = 'ProfileDropdown';

export default ProfileDropdown;

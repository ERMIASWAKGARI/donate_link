import { useState } from 'react';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../../components/NotificationBell';
import { useUser } from '../../../context/UserContext';

import { icons } from '../../../components/header/HeaderConfig';

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="shadow-sm h-16 bg-[#008080] flex items-center justify-between px-6 relative z-10">
      {/* Left: Logo/Menu */}
      <div className="flex items-center"></div>

      {/* Right: Actions */}
      <div className="flex items-center">
        <NotificationBell />

        {/* Spacer */}
        <div className="ml-4 relative rounded-md">
          <button
            className="flex items-center space-x-2 p-2  rounded-full transition"
            onClick={toggleDropdown}
          >
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
            <span className="text-sm font-medium text-white   ">
              {user?.name || 'Admin'}
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-2 border border-gray-100">
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/admin/profile');
                }}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/admin/account/settings');
                }}
              >
                <FiSettings className="mr-2" /> Account Settings
              </button>
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

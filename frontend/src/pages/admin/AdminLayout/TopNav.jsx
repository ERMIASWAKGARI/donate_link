import { useState } from 'react';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../../components/NotificationBell';
import { useUser } from '../../../context/UserContext';

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
    <header className="bg-[#008080] shadow-sm h-16 flex items-center justify-between px-6 relative z-10">
      {/* Left: Logo/Menu */}
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-600 hover:text-indigo-600">
          <FiMenu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center">
        <NotificationBell />

        {/* Spacer */}
        <div className="ml-4 relative">
          <button
            className="flex items-center space-x-2 p-2  rounded-full transition"
            onClick={toggleDropdown}
          >
            <img
              src={
                user?.profilePicture
                  ? `http://localhost:5000/uploads/${user.profilePicture}`
                  : '/default-avatar.png'
              }
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-white">
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
                  navigate('/profile');
                }}
              >
                <FiUser className="mr-2" /> Profile
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

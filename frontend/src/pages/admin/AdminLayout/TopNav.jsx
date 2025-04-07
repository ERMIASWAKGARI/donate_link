import { useState } from 'react';
import { FiBell, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useUser } from '../../../context/UserContext';

const TopNav = () => {
  const { user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 relative z-10">
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-600 hover:text-indigo-600">
          <FiMenu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-indigo-600">
          <FiBell size={20} />
        </button>

        <div className="relative">
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition"
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
            <span className="text-sm font-medium text-gray-700">
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
                  // Navigate to profile or open modal
                }}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                onClick={logout}
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

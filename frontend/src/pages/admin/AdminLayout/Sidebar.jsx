import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'User Management', path: '/admin/users', icon: 'people' },
    { name: 'Reports', path: '/admin/reports', icon: 'analytics' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`bg-[#008080] text-white shadow-md flex flex-col h-screen transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with hamburger */}
      <div className="p-4 h-16 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-teal-700 transition-colors"
        >
          <span className="material-icons">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="mt-6 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors duration-200 ${
                isActive ? 'bg-yellow-400 text-gray-800' : 'hover:bg-yellow-500'
              }`
            }
          >
            <span className="material-icons mr-3">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

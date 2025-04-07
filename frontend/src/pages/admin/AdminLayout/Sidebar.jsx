import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext'; // Adjust the import path as needed

const Sidebar = () => {
  const { logout } = useContext(UserContext); // Get the logout function from context

  const handleLogout = () => {
    logout(); // Call the logout function
    window.location.href = '/login'; // Redirect to login page
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'User Management', path: '/admin/users', icon: 'people' },
    { name: 'Reports', path: '/admin/reports', icon: 'analytics' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <div className="w-64 bg-indigo-800 text-white shadow-md flex flex-col h-screen">
      <div className="p-4 h-16 flex items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-6 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors duration-200 ${
                isActive ? 'bg-indigo-900' : 'hover:bg-indigo-700'
              }`
            }
          >
            <span className="material-icons mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      {/* Logout Button at the bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center px-6 py-3 text-left hover:bg-indigo-700 transition-colors duration-200 mb-4"
      >
        <span className="material-icons mr-3">logout</span>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;

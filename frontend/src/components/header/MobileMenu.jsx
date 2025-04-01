/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { headerLinks } from './HeaderConfig';

const MobileMenu = ({ menuOpen, setMenuOpen, user, handleLogout }) => {
  const role = user?.role || 'individual_donor';
  const roleLinks = headerLinks[role] || [];
  const allLinks = [...headerLinks.common, ...roleLinks];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="md:hidden fixed inset-0 top-20 bg-green-900 z-40 shadow-2xl p-6 space-y-4 overflow-y-auto"
    >
      {/* Profile Section */}
      <div className="flex items-center space-x-4 p-4 bg-green-800 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
          <UserIcon size={20} className="text-green-800" />
        </div>
        <div>
          <p className="font-medium">{user ? user.name : 'N/A'}</p>
          <p className="text-sm text-green-200">{user ? user.email : 'N/A'}</p>
          <p className="text-xs text-green-300 capitalize">
            {user ? user.role.replace('_', ' ') : 'Guest'}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      {allLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
          onClick={() => setMenuOpen(false)}
        >
          {link.text}
        </NavLink>
      ))}

      <div className="border-t border-green-700 my-2"></div>

      <button
        onClick={() => {
          handleLogout();
          setMenuOpen(false);
        }}
        className="w-full text-lg py-3 px-4 text-red-400 hover:bg-green-800 rounded-lg transition flex items-center"
      >
        <LogOut size={20} className="mr-3" />
        Sign Out
      </button>
    </motion.div>
  );
};

export default MobileMenu;

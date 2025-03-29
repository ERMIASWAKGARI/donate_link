import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Bell, User, LogOut, Settings, HelpCircle, Home, Heart, History, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";
import { UserContext } from "../../../context/UserContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDonationsOpen, setIsDonationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const navigate = useNavigate();
  
  const profileRef = useRef(null);
  const howItWorksRef = useRef(null);
  const donationsRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (howItWorksRef.current && !howItWorksRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (donationsRef.current && !donationsRef.current.contains(event.target)) {
        setIsDonationsOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [menuOpen]);
    
  const { user, logout } = useContext(UserContext);
  
  const handleLogout = () => {
    // Add your logout logic here
    logout();
    navigate("/login");
  };

  const dropdownVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
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

  
  // const handleLogout = () => {
  //   logout();
  //   navigate('/login'); // Redirect to login page after logout
  // };



  return (
    <motion.nav
      className="bg-green-800 text-white z-50 sticky top-0 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/dashboard")}
          >
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="ml-2 text-yellow-400 font-bold text-xl">DonatiLink</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {/* How It Works Dropdown */}
            <div className="relative" ref={howItWorksRef}>
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center hover:text-yellow-400 transition"
                whileHover={{ scale: 1.05 }}
              >
                How It Works
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="ml-1" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 mt-2 w-56 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
                  >
                    {[
                      { to: "/donate", text: "Choose Items to Donate" },
                      { to: "/ngos", text: "Select an NGO" },
                      { to: "/impact", text: "Track Your Impact" },
                      { to: "/faq", text: "FAQs" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-3 hover:bg-gray-100 transition ${
                              isActive ? "bg-gray-100 font-medium" : ""
                            }`
                          }
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
            <div className="relative" ref={donationsRef}>
              <motion.button
                onClick={() => setIsDonationsOpen(!isDonationsOpen)}
                className="flex items-center hover:text-yellow-400 transition"
                whileHover={{ scale: 1.05 }}
              >
                Donations
                <motion.div
                  animate={{ rotate: isDonationsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="ml-1" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isDonationsOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 mt-2 w-56 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
                  >
                    {[
                      { to: "/donate", text: "Make a Donation" },
                      { to: "/causes", text: "View Causes" },
                      { to: "/recurring", text: "Recurring Donations" },
                      { to: "/history", text: "Donation History" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-3 hover:bg-gray-100 transition ${
                              isActive ? "bg-gray-100 font-medium" : ""
                            }`
                          }
                        >
                          {item.text}
                        </NavLink>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Dropdown */}
            <div className="relative" ref={languageRef}>
              <motion.button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center hover:text-yellow-400 transition"
                whileHover={{ scale: 1.05 }}
              >
                ENG
                <motion.div
                  animate={{ rotate: isLanguageOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="ml-1" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 mt-2 w-32 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
                  >
                    {["English", "Spanish", "French", "German"].map((language, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <button
                          onClick={() => setIsLanguageOpen(false)}
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

            {/* Notification Icon */}
            <motion.button
              className="relative p-2 hover:text-yellow-400 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <motion.button
                className="flex items-center space-x-2 hover:text-yellow-400 transition"
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center">
                  <User size={18} className="text-green-800" />
                </div>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <p className="text-sm font-medium text-gray-700">{user? user.name : 'Guest'}</p>
                      <p className="text-sm font-semibold text-green-800 truncate">{ user? user.email : 'N/A'}</p>
                    </div>

                    {/* Main Links */}
                    <div className="py-1">
                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Home size={16} className="mr-3 text-green-700" />
                          Dashboard
                        </NavLink>
                      </motion.div>

                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <User size={16} className="mr-3 text-green-700" />
                          My Profile
                        </NavLink>
                      </motion.div>

                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/donations"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Heart size={16} className="mr-3 text-green-700" />
                          My Donations
                        </NavLink>
                      </motion.div>

                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/history"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <History size={16} className="mr-3 text-green-700" />
                          Donation History
                        </NavLink>
                      </motion.div>
                    </div>

                    {/* Secondary Links */}
                    <div className="py-1 border-t border-gray-100">
                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/settings"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Settings size={16} className="mr-3 text-green-700" />
                          Account Settings
                        </NavLink>
                      </motion.div>

                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/payment-methods"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <CreditCard size={16} className="mr-3 text-green-700" />
                          Payment Methods
                        </NavLink>
                      </motion.div>
                    </div>

                    {/* Help & Logout */}
                    <div className="py-1 border-t border-gray-100">
                      <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                        <NavLink
                          to="/help"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <HelpCircle size={16} className="mr-3 text-green-700" />
                          Help Center
                        </NavLink>
                      </motion.div>

                      <motion.div 
                        whileHover={{ backgroundColor: "#fee2e2" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? (
                <X size={28} className="text-yellow-400" />
              ) : (
                <Menu size={28} />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="md:hidden fixed inset-0 top-20 bg-green-900 z-40 shadow-2xl p-6 space-y-4 overflow-y-auto"
          >
            {/* Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-green-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                <User size={20} className="text-green-800" />
              </div>
              <div>
                <p className="font-medium">{user? user.name : 'N/A'}</p>
                <p className="text-sm text-green-200">{user? user.email : 'N/A'}</p>
              </div>
            </div>

            {/* Menu Items */}
            <NavLink
              to="/dashboard"
              className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/profile"
              className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
              onClick={() => setMenuOpen(false)}
            >
              My Profile
            </NavLink>

            <NavLink
              to="/donations"
              className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
              onClick={() => setMenuOpen(false)}
            >
              My Donations
            </NavLink>

            <NavLink
              to="/history"
              className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
              onClick={() => setMenuOpen(false)}
            >
              Donation History
            </NavLink>

            <NavLink
              to="/settings"
              className="block text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
              onClick={() => setMenuOpen(false)}
            >
              Account Settings
            </NavLink>

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
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;
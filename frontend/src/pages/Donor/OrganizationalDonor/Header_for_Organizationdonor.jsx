import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Bell, User, LogOut, Settings, HelpCircle, Home, Heart, History, CreditCard, Search } from "lucide-react";
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
  const { user, logout } = useContext(UserContext);
  
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

  const handleLogout = () => {
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
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-300" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                className="block w-64 pl-10 pr-3 py-2 text-sm bg-green-700 bg-opacity-20 border border-green-600 rounded-md text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

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
                <span className="hidden lg:inline">{user?.name || "Account"}</span>
                <ChevronDown size={16} className="ml-1" />
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
                      <p className="text-sm font-medium text-gray-700">Signed in as</p>
                      <p className="text-sm font-semibold text-green-800 truncate">{user?.email || "Guest"}</p>
                    </div>

                    {/* Main Links */}
                    <div className="py-1">
                      {[
                        { icon: <Home size={16} className="mr-3 text-green-700" />, text: "Dashboard", to: "/dashboard" },
                        { icon: <User size={16} className="mr-3 text-green-700" />, text: "My Profile", to: "/profile" },
                        { icon: <Heart size={16} className="mr-3 text-green-700" />, text: "My Donations", to: "/donations" },
                        { icon: <History size={16} className="mr-3 text-green-700" />, text: "Donation History", to: "/history" },
                      ].map((item, index) => (
                        <motion.div key={index} whileHover={{ backgroundColor: "#f3f4f6" }}>
                          <NavLink
                            to={item.to}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            {item.icon}
                            {item.text}
                          </NavLink>
                        </motion.div>
                      ))}
                    </div>

                    {/* Secondary Links */}
                    <div className="py-1 border-t border-gray-100">
                      {[
                        { icon: <Settings size={16} className="mr-3 text-green-700" />, text: "Account Settings", to: "/settings" },
                        { icon: <CreditCard size={16} className="mr-3 text-green-700" />, text: "Payment Methods", to: "/payment-methods" },
                        { icon: <HelpCircle size={16} className="mr-3 text-green-700" />, text: "Help Center", to: "/help" },
                      ].map((item, index) => (
                        <motion.div key={index} whileHover={{ backgroundColor: "#f3f4f6" }}>
                          <NavLink
                            to={item.to}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            {item.icon}
                            {item.text}
                          </NavLink>
                        </motion.div>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="py-1 border-t border-gray-100">
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
                <p className="font-medium">{user?.name || "Guest"}</p>
                <p className="text-sm text-green-200">{user?.email || "Not signed in"}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-green-300" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                className="block w-full pl-10 pr-3 py-2 bg-green-800 bg-opacity-30 border border-green-600 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Menu Items */}
            {[
              { icon: <Home size={20} className="mr-3" />, text: "Dashboard", to: "/dashboard" },
              { icon: <User size={20} className="mr-3" />, text: "My Profile", to: "/profile" },
              { icon: <Heart size={20} className="mr-3" />, text: "My Donations", to: "/donations" },
              { icon: <History size={20} className="mr-3" />, text: "Donation History", to: "/history" },
              { icon: <Settings size={20} className="mr-3" />, text: "Settings", to: "/settings" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center text-lg py-3 px-4 hover:bg-green-800 rounded-lg transition"
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                {item.text}
              </NavLink>
            ))}

            <div className="border-t border-green-700 my-2"></div>

            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center text-lg py-3 px-4 text-red-400 hover:bg-green-800 rounded-lg transition"
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
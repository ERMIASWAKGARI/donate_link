import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../src/assets/logosa.png";
import GoogleTranslate from "../../context/GoogleTranslate";

// public/;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDonationsOpen, setIsDonationsOpen] = useState(false);
  const navigate = useNavigate();

  const howItWorksRef = useRef(null);
  const donationsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        howItWorksRef.current &&
        !howItWorksRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
      if (
        donationsRef.current &&
        !donationsRef.current.contains(event.target)
      ) {
        setIsDonationsOpen(false);
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

  // Animation variants
  const mobileMenuVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
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
    <>
      <motion.nav
        className="bg-primary text-white z-50 sticky top-0 shadow-lg"
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
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="Logo" className="h-18 w-auto" />
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {/* Home Link */}
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 group transition duration-300 ${
                    isActive ? "text-yellow-400" : ""
                  }`
                }
              >
                <motion.div
                  className="w-2/4 h-[2px] bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </NavLink>

              <a
                href="#featured"
                className="flex flex-col items-center gap-1 group transition duration-300"
              >
                <p className="hover:text-yellow-400">Featured Causes</p>
                <motion.div
                  className="w-2/4 h-[2px] bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </a>

              {/* About Us Link */}
              <a
                href="#about"
                className="flex flex-col items-center gap-1 group transition duration-300"
              >
                <p className="hover:text-yellow-400">About Us</p>
                <motion.div
                  className="w-2/4 h-[2px] bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </a>

              {/* How It Works Dropdown */}
              <a
                href="#howitworks"
                className="flex flex-col items-center gap-1 group transition duration-300"
              >
                <p className="hover:text-yellow-400">How it Works</p>
                <motion.div
                  className="w-2/4 h-[2px] bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </a>

              {/* Contact Us */}
              <a
                href="#contact"
                className="flex flex-col items-center gap-1 group transition duration-300"
              >
                <p className="hover:text-yellow-400">Contact Us</p>
                <motion.div
                  className="w-2/4 h-[2px] bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </a>

              <GoogleTranslate />
            </div>

            {/* <GoogleTranslate /> */}
            {/* Add this right before the Register button */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                onClick={() => navigate("/login")}
                className="bg-transparent border border-yellow-400 text-yellow-400 px-6 py-2 rounded-full font-medium hover:bg-yellow-400 hover:text-green-900 transition cursor-pointer shadow-md"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(234, 179, 8, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>

              <motion.button
                onClick={() => navigate("/register")}
                className="bg-yellow-400 text-[#000] px-6 py-2 rounded-full font-medium hover:bg-yellow-500 transition cursor-pointer shadow-md"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(234, 179, 8, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Register Now
              </motion.button>
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
              variants={mobileMenuVariants}
              initial={{ x: "100%" }} // Start from the right edge (off-screen)
              animate={{ x: "50%" }} // Animate to half-width
              exit={{ x: "100%" }} // Exit back to right edge (off-screen)
              className="md:hidden fixed inset-0 top-20 bg-primary z-50 shadow-2xl p-8 space-y-4 overflow-y-auto w-full sm:w-1/2 mx-auto"
            >
              <NavLink
                to="/"
                className="block text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <a
                href="#featured"
                className="block text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                Featured Causes
              </a>
              <a
                href="#about"
                className="block text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                About Us
              </a>

              <div className="pt-2">
                <button
                  className="flex items-center justify-between w-full text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  How It Works
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pl-4 space-y-3 mt-2">
                    {[
                      { to: "/signup", text: "Sign Up" },
                      { to: "/donate", text: "Choose Items" },
                      { to: "/ngos", text: "Select an NGO" },
                      { to: "/impact", text: "Track Impact" },
                      { to: "/faq", text: "FAQs" },
                    ].map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className="block py-2 hover:text-yellow-400 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  className="flex items-center justify-between w-full text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                  onClick={() => setIsDonationsOpen(!isDonationsOpen)}
                >
                  Donations
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      isDonationsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDonationsOpen && (
                  <div className="pl-4 space-y-3 mt-2">
                    {[
                      { to: "/donate", text: "Make a Donation" },
                      { to: "/causes", text: "View Causes" },
                      { to: "/recurring", text: "Recurring Donations" },
                      { to: "/history", text: "Donation History" },
                    ].map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className="block py-2 hover:text-yellow-400 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="#contact"
                className="block text-xl py-3 border-b border-green-700 hover:text-yellow-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </a>

              <motion.button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-1/2 sm:w-full bg-transparent border border-yellow-400 text-yellow-400 px-4 py-2 rounded-full font-medium text-lg mb-4 hover:bg-yellow-400 hover:text-green-900 transition shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>

              <motion.button
                onClick={() => {
                  navigate("/register");
                  setMenuOpen(false);
                }}
                className="w-1/2 flex flex-col sm:w-full bg-yellow-400 text-green-900 px-1 py-2 rounded-full font-medium text-lg mt-2 hover:bg-yellow-500 transition shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register Now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Header;

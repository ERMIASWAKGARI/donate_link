import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { UserContext } from "../../context/UserContext";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  return (
    <motion.nav
      className="bg-[#008080] text-white z-50 sticky top-0 shadow-lg"
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
            onClick={() => {
              if (user) {
                if (user.role === "volunteer") {
                  navigate("/volunteer/dashboard");
                } else if (
                  user.role === "individual_donor" ||
                  user.role === "organization_donor"
                ) {
                  navigate("/donor/dashboard");
                } else if (user.role === "ngo") {
                  navigate("/ngo/dashboard");
                } else if (user.role === "admin") {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/");
                }
              } else {
                navigate("/");
              }
            }}
          >
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="ml-2 text-yellow-400 font-bold text-xl">
              DonateLink
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <DesktopNav user={user} handleLogout={handleLogout} />

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
          <MobileMenu
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            user={user}
            handleLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;

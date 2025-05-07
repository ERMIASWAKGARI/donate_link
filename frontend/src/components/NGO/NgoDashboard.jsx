import { useContext, useState } from "react";
import {
  FaBars,
  FaChevronRight,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaHome,
  FaChevronLeft,
  FaTimes,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import { Outlet, NavLink, Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import Header from "../header/Header";

export default function NgoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useContext(UserContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const headerHeight = "4px";

  const navItems = [
    { to: "", icon: <FaHome />, label: "Dashboard" },
    { to: "needs", icon: <FaHandHoldingHeart />, label: "Posted Needs" },
    { to: "donations", icon: <FaHandsHelping />, label: "Received Donations" },
    {
      to: "pending-donations",
      icon: <FaHandsHelping />,
      label: "Available Donations",
      alwaysAccessible: true,
    },
    { to: "volunteers", icon: <FaUser />, label: "Applications" },
    { to: "reports", icon: <FaFileAlt />, label: "Reports" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile toggle button */}
        <div
          className="md:hidden fixed top-20 left-4 z-50"
          style={{ top: `calc(${headerHeight} + 1rem)` }}
        >
          <button
            onClick={toggleMobileSidebar}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transform fixed md:relative z-40 ${
            sidebarOpen ? "w-64" : "w-20"
          } bg-[#008080] text-white h-full transition-all duration-300 ease-in-out flex-shrink-0`}
          style={{ height: `calc(100vh - ${headerHeight})` }}
        >
          <div className="p-4 flex items-center justify-between border-b border-blue-700">
            <h1 className="text-xl font-bold truncate">
              {sidebarOpen || mobileSidebarOpen ? user?.name : user?.name[0]}
            </h1>
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-1 hover:bg-[#008080] rounded focus:outline-none"
            >
              {sidebarOpen ? (
                <FaChevronLeft size={14} />
              ) : (
                <FaChevronRight size={14} />
              )}
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map(({ to, icon, label, alwaysAccessible }) => {
                const isAccessible = user?.isVerified || alwaysAccessible;

                return (
                  <li key={to}>
                    {isAccessible ? (
                      <NavLink
                        to={to}
                        end
                        className={({ isActive }) =>
                          `flex items-center p-2 w-full rounded transition-colors ${
                            isActive ? "bg-yellow-400 text-black" : ""
                          }`
                        }
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        {icon}
                        {(sidebarOpen || mobileSidebarOpen) && (
                          <span className="ml-3 truncate">{label}</span>
                        )}
                      </NavLink>
                    ) : (
                      <div
                        className="flex items-center p-2 w-full rounded opacity-50 cursor-not-allowed"
                        title="Verify your account to access this section"
                      >
                        {icon}
                        {(sidebarOpen || mobileSidebarOpen) && (
                          <span className="ml-3 truncate">{label}</span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ height: `calc(100vh - ${headerHeight})` }}
          >
            {!user?.isVerified && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                <p className="font-semibold">Account not verified</p>
                <p>
                  Please{" "}
                  <Link
                    to="/profile"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    upload the required documents
                  </Link>{" "}
                  in your profile to verify your account and unlock all
                  features.
                </p>
              </div>
            )}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

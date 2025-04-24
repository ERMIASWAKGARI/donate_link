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
import PendingDonations from "./pendingDonations";
import PostedNeeds from "./postedNeeds";
import DonationsList from "./donationsList";
import VolunteerApplication from "./VolunteerApplication";
import { UserContext } from "../../context/UserContext";
import Header from "../header/Header";
import Reports from "./Reports";
import NGOStatistics from "./NGOStatistics";

export default function NgoDashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const { user } = useContext(UserContext);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "needs":
        return (
          <PostedNeeds
            showNeedForm={showNeedForm}
            setShowNeedForm={setShowNeedForm}
          />
        );
      case "donations":
        return <DonationsList />;
      case "volunteers":
        return <VolunteerApplication />;
      case "pending-donations":
        return <PendingDonations />;
      case "reports":
        return <Reports />;
      default:
        return <NGOStatistics />;
    }
  };

  // Assuming your header height is around 64px (h-16)
  const headerHeight = "4px";

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <Header />
      <div className="flex flex-1 overflow-hidden">
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
              {sidebarOpen || mobileSidebarOpen
                ? `${user?.name}`
                : `${user?.name.slice(0, 1)}`}
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
              <li>
                <button
                  onClick={() => {
                    setActiveSection("home");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "home" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaHome className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Dashboard</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection("needs");
                    setMobileSidebarOpen(false);
                    setShowNeedForm(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "needs" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaHandHoldingHeart className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Posted Needs</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection("donations");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "donations" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaHandsHelping className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Received Donations</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection("pending-donations");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "pending-donations" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaHandsHelping className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Available Donations</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection("volunteers");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "volunteers" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaUser className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Applications</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection("reports");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-2 w-full rounded transition-colors ${
                    activeSection === "reports" ? "bg-yellow-400" : ""
                  }`}
                >
                  <FaFileAlt className="text-lg flex-shrink-0" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 truncate">Reports</span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ height: `calc(100vh - ${headerHeight})` }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

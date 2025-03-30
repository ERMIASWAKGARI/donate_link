import React, { useState, useContext } from "react";
import PostNeedForm from "./PostNeedsForm";
import {
  FaHome,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaUsers,
  FaBars,
  FaTimes,
  FaGreaterThan,
  FaLessThan,
} from "react-icons/fa";
import PostedNeeds from "./postedNeeds";
import DonationsList from "./donationsList";
import VolunteerApplication from "./VolunteerApplication";
import { UserContext } from "../../context/UserContext";

const ngoData = {
  name: "Helping Hands NGO",
  email: "contact@helpinghands.org",
  needs: [
    {
      id: 1,
      type: "money",
      description: "Emergency relief fund",
      amount: "50,000 ETB",
      status: "Pending",
    },
    {
      id: 2,
      type: "items",
      description: "Winter Clothes for 100 people",
      status: "Pending",
    },
    {
      id: 3,
      type: "volunteer",
      description: "Teaching volunteers for kids",
      status: "Open",
    },
  ],
  donations: [
    {
      id: 1,
      donor: "John Doe",
      amount: "5000 ETB",
      type: "money",
      status: "Completed",
    },
    {
      id: 2,
      donor: "Jane Smith",
      item: "50 Jackets",
      type: "items",
      status: "Pending",
    },
  ],
  volunteers: [
    { id: 1, name: "Samuel Tesfaye", role: "Teaching" },
    { id: 2, name: "Martha Tadesse", role: "Medical Aid" },
  ],
};

export default function NgoDashboard() {
  const [needs, setNeeds] = useState(ngoData.needs);
  const [donations, setDonations] = useState(ngoData.donations);
  const [volunteers, setVolunteers] = useState(ngoData.volunteers);
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

  const handleAddNeed = (newNeed) => {
    const newNeedWithId = {
      ...newNeed,
      id: needs.length + 1,
    };
    setNeeds([...needs, newNeedWithId]);
    setShowNeedForm(false);
  };

  const handleDeleteNeed = (id) => {
    setNeeds(needs.filter((need) => need.id !== id));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "needs":
        return (
          <PostedNeeds
            needs={needs}
            handleDeleteNeed={handleDeleteNeed}
            showNeedForm={showNeedForm}
            setShowNeedForm={setShowNeedForm}
          />
        );
      case "donations":
        return <DonationsList donations={donations} />;
      case "volunteers":
        return <VolunteerApplication volunteers={volunteers} />;
      default:
        return (
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-blue-700">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-600">Email: {user.email}</p>
            <div className="mt-4 p-4 bg-white shadow rounded-lg">
              <p className="text-lg">Welcome to your NGO Dashboard</p>
              <p className="text-gray-600 mt-2">
                Select a section from the sidebar to view details about your
                needs, donations, or volunteers.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile sidebar toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
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
        } bg-[#006400] text-white h-full transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          <h1 className="text-xl font-bold truncate">
            {sidebarOpen || mobileSidebarOpen
              ? `${user.name}`
              : `${user.name.slice(0, 1)}`}
          </h1>
          <button
            onClick={toggleSidebar}
            className="hidden md:block p-1 hover:bg-blue-700 rounded focus:outline-none"
          >
            {sidebarOpen ? (
              <FaLessThan size={14} />
            ) : (
              <FaGreaterThan size={14} />
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
                className={`flex items-center p-2 w-full rounded hover:bg-[#008080] transition-colors ${
                  activeSection === "home" ? "bg-blue-600" : ""
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
                className={`flex items-center p-2 w-full rounded hover:bg-[#008080] transition-colors ${
                  activeSection === "needs" ? "bg-[#006466]" : ""
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
                className={`flex items-center p-2 w-full rounded hover:bg-[#008080] transition-colors ${
                  activeSection === "donations" ? "bg-blue-600" : ""
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
                  setActiveSection("volunteers");
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center p-2 w-full rounded hover:bg-[#008080] transition-colors ${
                  activeSection === "volunteers" ? "bg-yellow-400" : ""
                }`}
              >
                <FaUsers className="text-lg flex-shrink-0" />
                {(sidebarOpen || mobileSidebarOpen) && (
                  <span className="ml-3 truncate">Applications</span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? "md:ml-24 mx-auto" : "md:ml-10"
        }`}
      >
        <div className="p-4 md:p-6">{renderContent()}</div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import NeedHomeDetail from "./NeedHomeDetail";
import { FiInfo } from "react-icons/fi";
import { Spin } from "antd";
import { FaTimes, FaUserPlus, FaArrowRight } from "react-icons/fa";

const FeaturedCauses = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/donation/HomeNeeds`
      );
      setNeeds(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchNeeds();
  }, []);

  const handleViewAll = () => {
    setShowAll(!showAll);
  };

  const handleNeedSelect = (need) => {
    setSelectedNeed(need);
  };

  const handleCloseDetail = () => {
    setSelectedNeed(null);
  };

  const handleActionClick = (need) => {
    setSelectedNeed(need);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setActionLoading(false);
  };

  const handleRegisterRedirect = () => {
    setActionLoading(true);
    // Simulate loading before redirect
    setTimeout(() => {
      window.location.href = "/register";
    }, 1000);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: { duration: 1.5, delay: 0.5, ease: "easeInOut" },
    },
  };

  const displayedNeeds = showAll ? needs : needs.slice(0, 3);

  if (loading && !needs.length) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <section
      className="py-6 bg-gradient-to-b from-gray-50 to-white"
      id="featured"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our <span className="text-primary">Featured Causes</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Join us in making a difference. Each contribution brings us closer
            to our goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayedNeeds.map((need) => {
            const raised = need.amountRaised || 0;
            const goal = need.amountNeeded || 1;
            const progressPercent = Math.min(
              Math.round((raised / goal) * 100),
              100
            );
            const imageUrl = need?.beneficiaryInfo?.pictures?.[0]
              ? `http://localhost:5000/uploads/${need.beneficiaryInfo.pictures[0].replace(
                  /\\/g,
                  "/"
                )}`
              : null;

            const fullDescription =
              need.description || "Help support this important cause.";
            const hasLongDescription = fullDescription.length > 100;
            const shortDescription = hasLongDescription
              ? fullDescription.slice(0, 100) + "..."
              : fullDescription;

            return (
              <motion.div
                key={need._id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group"
                data-aos="fade-up"
              >
                <div className="relative overflow-hidden h-60">
                  {imageUrl ? (
                    <motion.img
                      src={imageUrl}
                      alt={need.title}
                      className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2 }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                      {progressPercent}% Funded
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {need.title}
                  </h3>

                  <div className="flex items-start">
                    <p className="text-gray-600 mb-2 flex-1">
                      {shortDescription}
                    </p>
                    {hasLongDescription && (
                      <button
                        onClick={() => handleNeedSelect(need)}
                        className="text-teal-700 hover:text-teal-800 ml-2 mt-1 cursor-pointer"
                        aria-label="View more details"
                      >
                        <FiInfo size={18} />
                      </button>
                    )}
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>${raised.toLocaleString()} raised</span>
                      <span>${goal.toLocaleString()} goal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                        initial="hidden"
                        whileInView="visible"
                        variants={progressVariants}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick(need)}
                    className="w-full bg-yellow-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {need.needTypes?.includes("service")
                      ? "Apply Now"
                      : "Donate Now"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {needs.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <button
              onClick={handleViewAll}
              className="px-8 py-3 border-2 border-[#008080] text-[#008080] font-medium rounded-full hover:bg-teal-600 hover:text-white transition-all duration-300"
            >
              {showAll ? "Show Less" : "View All Causes"}
            </button>
          </motion.div>
        )}
      </div>

      {/* Need Detail Modal */}
      {selectedNeed && (
        <NeedHomeDetail need={selectedNeed} onClose={handleCloseDetail} />
      )}

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedNeed?.needTypes?.includes("service")
                    ? "Apply for this opportunity"
                    : "Make a donation"}
                </h3>
                <button
                  onClick={handleCloseAuthModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                  <FaUserPlus className="text-blue-500 text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Account Required
                </h4>
                <p className="text-gray-600 mb-6">
                  You need to be registered and logged in to{" "}
                  {selectedNeed?.needTypes?.includes("service")
                    ? "apply for this opportunity"
                    : "make a donation"}
                  .
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleRegisterRedirect}
                    disabled={actionLoading}
                    className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <Spin className="mr-2" />
                    ) : (
                      <>
                        Register Now <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseAuthModal}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    I WIll do it later
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Already have an account?{" "}
                  <a href="/login" className="text-teal-600 hover:underline">
                    Log in here
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default FeaturedCauses;

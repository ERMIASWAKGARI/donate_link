import { useState } from "react";
import NeedInformation from "../Donor/IndividualDonor/NeedInformation";
import Map from "../../components/NGO/Map";
import { FaTimes, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const NeedHomeDetail = ({ need, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.2 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          variants={modalVariants}
        >
          {/* Header */}
          <div className="bg-primary p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{need.title}</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    {need.beneficiaryInfo?.location?.address ||
                      "Location not specified"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      need.status === "Fulfilled"
                        ? "bg-green-100 text-green-800"
                        : need.status === "Expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <IoMdTime className="mr-2" /> {need.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      need.urgencyLevel === "High"
                        ? "bg-red-100 text-red-800"
                        : need.urgencyLevel === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <FaInfoCircle className="mr-2" /> {need.urgencyLevel}{" "}
                    Priority
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Close modal"
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Need Information */}
                <NeedInformation need={need} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Map */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-full">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                    <FaMapMarkerAlt className="mr-2 text-primary" />
                    Location Details
                  </h3>
                  {need.beneficiaryInfo?.location ? (
                    <>
                      <div className="h-64 rounded-lg overflow-hidden mb-4">
                        <Map
                          latitude={need.beneficiaryInfo.location.latitude}
                          longitude={need.beneficiaryInfo.location.longitude}
                        />
                      </div>
                      <p className="text-gray-700">
                        {need.beneficiaryInfo.location.address}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Location not specified</p>
                  )}
                </div>

                {/* Progress */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Funding Progress
                  </h3>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>
                        Raised: ${(need.amountRaised || 0).toLocaleString()}
                      </span>
                      <span>
                        Goal: ${(need.amountNeeded || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            Math.round(
                              ((need.amountRaised || 0) /
                                (need.amountNeeded || 1)) *
                                100
                            ),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NeedHomeDetail;

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import ApplicationForm from "./ApplicationForm";
import axios from "axios";
import MapLocation from "./MapLocation";
import { motion } from "framer-motion";
// import Map from "../../components/NGO/Map";

const NeedDetailsModal = ({ need, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [currentNeed, setCurrentNeed] = useState(null);

  useEffect(() => {
    if (need) {
      setCurrentNeed(need);
      setLoading(false);
    }
  }, [need]);

  const handleSubmitApplication = async (applicationData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.post(
        `http://localhost:5000/api/application/${need._id}/apply`,
        {
          motivation: applicationData.motivation,
          startDate: applicationData.startDate,
          endDate: applicationData.endDate,
          hoursPerWeek: applicationData.hoursPerWeek,
          category: applicationData.category,
          subCategory: applicationData.subCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Application submitted successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to submit application. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-6">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          </div>

          {/* Gallery Skeleton */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 ml-2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || !currentNeed) {
    return <SkeletonLoader />;
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 border border-gray-100">
        {/* Modal Header with Teal Background */}
        <div className=" top-0 bg-[#008080] text-white p-6 rounded-t-xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{need.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center border border-green-100"
            >
              <FaCheckCircle className="mr-3 text-green-600" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-100"
            >
              <FaExclamationCircle className="mr-3 text-red-600" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Need Details */}
            <div className="space-y-6">
              {need.beneficiaryInfo?.pictures?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className=" p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-[#008080] mb-3">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {need.beneficiaryInfo.pictures.map((pic, index) => (
                      <motion.div
                        key={pic}
                        whileHover={{ scale: 1.03 }}
                        className="h-40 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img
                          src={`http://localhost:5000/uploads/${pic.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={`Need ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=" p-4 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-[#008080] ">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {need.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=" p-4 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-[#008080] ">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-28 font-medium text-gray-600">
                      Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        need.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : need.status === "Fulfilled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {need.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-28 font-medium text-gray-600">
                      Urgency:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        need.urgencyLevel === "High"
                          ? "bg-red-100 text-red-800"
                          : need.urgencyLevel === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {need.urgencyLevel}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-[#008080] mr-2" />
                    <span className="text-gray-700">
                      Ends: {new Date(need.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=" p-4 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-[#008080] ">
                  Location
                </h3>
                <div className="flex items-start mb-3">
                  <FaMapMarkerAlt className="text-[#008080] mr-2 mt-1" />
                  <p className="text-gray-700">
                    {need.beneficiaryInfo?.location?.address}
                  </p>
                </div>
                <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                  <MapLocation
                    latitude={need.beneficiaryInfo?.location?.latitude}
                    longitude={need.beneficiaryInfo?.location?.longitude}
                  />

                  {/* <Map
                    latitude={need.beneficiaryInfo.location.latitude}
                    longitude={need.beneficiaryInfo.location.longitude}
                  /> */}
                </div>
                <div className=" p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#008080] ">
                    Beneficiaries
                  </h3>
                  <div className="flex items-center">
                    <FaUsers className="text-[#008080] mr-2" />
                    <span className="text-gray-700">
                      {need.beneficiaryInfo?.numberOfBeneficiaries} people will
                      benefit
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Application Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sticky top-4"
            >
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-[#008080] mb-6 pb-2 border-b border-gray-200">
                  Apply for this Opportunity
                </h3>
                <ApplicationForm
                  need={need}
                  onSubmit={handleSubmitApplication}
                  loading={loading}
                />
              </div>

              <div className=" p-4 rounded-lg mt-3">
                <h3 className="text-lg font-semibold text-[#008080] mt-3 mb-3">
                  Required Services
                </h3>
                <div className="space-y-3">
                  {need.categories?.service?.map((service, index) => (
                    <div
                      key={`service-${index}`}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-[#008080] transition-colors"
                    >
                      <p className="font-medium text-gray-800">
                        {service.categoryName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {service.subCategoryName} (Vacancy: {service.vacancy})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 pt-6 border-t border-gray-200 flex justify-end"
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close Details
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

NeedDetailsModal.propTypes = {
  need: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    urgencyLevel: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    beneficiaryInfo: PropTypes.shape({
      pictures: PropTypes.arrayOf(PropTypes.string),
      numberOfBeneficiaries: PropTypes.number.isRequired,
      location: PropTypes.shape({
        address: PropTypes.string.isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    categories: PropTypes.shape({
      service: PropTypes.arrayOf(
        PropTypes.shape({
          categoryName: PropTypes.string.isRequired,
          subCategoryName: PropTypes.string.isRequired,
          vacancy: PropTypes.string.isRequired,
        })
      ).isRequired,
    }).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NeedDetailsModal;

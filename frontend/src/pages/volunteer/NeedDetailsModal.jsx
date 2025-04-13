import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";
import ApplicationForm from "./ApplicationForm";
import axios from "axios";

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
      console.log("Access Token", token);
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
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

      console.log("Application submitted:", response.data);
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

  if (loading || !currentNeed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
          <p className="mt-4 text-center">Loading need details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
              <FaCheckCircle className="mr-2" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
              <FaExclamationCircle className="mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{need.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Need Details */}
            <div>
              {need.beneficiaryInfo?.pictures?.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {need.beneficiaryInfo.pictures.map((pic, index) => (
                      <div
                        key={pic}
                        className="h-32 rounded-md overflow-hidden"
                      >
                        <img
                          src={`http://localhost:5000/uploads/${pic.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={`Need ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{need.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <span className="w-24 font-medium">Urgency:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    <span>
                      Ends: {new Date(need.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Beneficiaries
                </h3>
                <div className="flex items-center mb-2">
                  <FaUsers className="text-gray-400 mr-2" />
                  <span>
                    {need.beneficiaryInfo?.numberOfBeneficiaries} people
                  </span>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p>{need.beneficiaryInfo?.location?.address}</p>
                    <p className="text-xs text-gray-500">
                      (Lat: {need.beneficiaryInfo?.location?.latitude}, Lng:{" "}
                      {need.beneficiaryInfo?.location?.longitude})
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Required Services
                </h3>
                <div className="space-y-2">
                  {need.categories?.service?.map((service, index) => (
                    <div
                      key={`service-${index}`}
                      className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                    >
                      <p className="font-medium text-blue-800">
                        {service.categoryName}
                      </p>
                      <p className="text-sm text-blue-600">
                        {service.subCategoryName} (Vacancy: {service.vacancy})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Application Form (always shown) */}
            <div>
              <ApplicationForm
                need={need}
                onSubmit={handleSubmitApplication}
                loading={loading}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
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

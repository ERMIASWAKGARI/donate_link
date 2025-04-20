import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../config/axiosConfig";
import {
  FaCloudUploadAlt,
  FaImages,
  FaFileAlt,
  FaUsers,
  FaBoxes,
  FaMoneyBillWave,
} from "react-icons/fa";

const ReportForm = ({ selectedNeeds, onGenerate, clearSelection }) => {
  const [description, setDescription] = useState("");
  const [pictures, setPictures] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedNeeds?._id) return;
      setLoadingPreview(true);
      try {
        const response = await axios.get(
          `donation/reportPreview/${selectedNeeds._id}`,
          {
            params: {
              needTypes: selectedNeeds.needTypes,
              needId: selectedNeeds._id,
              categories: selectedNeeds.categories,
            },
          }
        );
        if (response.data.success) {
          setPreviewData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching preview data:", error);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchData();
  }, [selectedNeeds]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPictures(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("needId", selectedNeeds._id);
      formData.append("needTypes", JSON.stringify(selectedNeeds.needTypes));
      pictures.forEach((file) => formData.append("pictures", file));

      const response = await axios.post("donation/report", formData, {
        params: { needTypes: selectedNeeds.needTypes },
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        onGenerate(response.data.report);
        resetForm();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setPictures([]);
    setShowPreview(false);
    clearSelection();
  };

  const handlePreviewClick = () => {
    if (canPreview) {
      setShowPreview(true);
    }
  };

  const canPreview = description.trim() !== "" && pictures.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Form header */}
        <div className="bg-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Create Impact Report
            </h2>
            <span className="bg-teal-700 text-teal-100 text-xs font-medium px-3 py-1 rounded-full">
              {selectedNeeds?.title}
            </span>
          </div>
          <p className="mt-1 text-teal-100">
            Document the donations received and their impact
          </p>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-6">
          {/* Description field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FaFileAlt className="mr-2 text-teal-600" />
              Impact Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              placeholder="Describe how the donations were used and their impact on beneficiaries..."
              required
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FaImages className="mr-2 text-teal-600" />
              Upload Impact Photos *
            </label>
            <div className="mt-1">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-all">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {pictures.length > 0 ? (
                      <span className="text-teal-600 font-medium">
                        {pictures.length} photo(s) selected
                      </span>
                    ) : (
                      <>
                        <span className="font-medium">
                          Drag & drop photos here
                        </span>
                        <br />
                        or click to browse (max 10 images)
                      </>
                    )}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          {/* Preview section */}
          {previewData && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview Data Loaded
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {previewData.donations?.services && (
                  <div className="bg-white p-2 rounded flex items-center">
                    <FaUsers className="text-teal-600 mr-2" />
                    {previewData.donations.services.length} service donations
                  </div>
                )}
                {previewData.donations?.materials && (
                  <div className="bg-white p-2 rounded flex items-center">
                    <FaBoxes className="text-teal-600 mr-2" />
                    {previewData.donations.materials.length} material donations
                  </div>
                )}
                {selectedNeeds.needTypes.includes("money") && (
                  <div className="bg-white p-2 rounded flex items-center">
                    <FaMoneyBillWave className="text-teal-600 mr-2" />
                    {selectedNeeds.targetMoney} ETB requested
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <div className="space-x-3">
            <button
              type="button"
              onClick={handlePreviewClick}
              disabled={!canPreview || loadingPreview}
              className={`px-6 py-2 rounded-lg font-medium border ${
                canPreview
                  ? "border-teal-600 text-teal-600 hover:bg-teal-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              } transition flex items-center`}
            >
              {loadingPreview ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Preview Report"
              )}
            </button>
            <button
              type="submit"
              disabled={!canPreview || isSubmitting}
              className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Generate Report"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    Report Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Report Overview */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      {selectedNeeds.title}
                    </h4>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* Impact Photos */}
                  {pictures.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="text-md font-medium text-gray-700 flex items-center">
                        <FaImages className="mr-2 text-teal-600" />
                        Photographs of Our Impact
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {pictures.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Impact ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Donation Summary */}
                  {previewData && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                          <FaFileAlt className="mr-2 text-teal-600" />
                          Donation Summary
                        </h5>

                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              What We Requested
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {selectedNeeds.needTypes.includes("service") &&
                                selectedNeeds.categories.service.map(
                                  (category, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-3 rounded-lg shadow-xs border"
                                    >
                                      <span className="font-medium text-teal-600">
                                        {category.vacancy}
                                      </span>{" "}
                                      {category.subCategoryName}
                                    </div>
                                  )
                                )}
                              {selectedNeeds.needTypes.includes("material") &&
                                selectedNeeds.categories.material.map(
                                  (category, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-3 rounded-lg shadow-xs border"
                                    >
                                      <span className="font-medium text-teal-600">
                                        {category.targetAmountNeeded}
                                      </span>{" "}
                                      {category.subCategoryName}
                                    </div>
                                  )
                                )}
                              {selectedNeeds.needTypes.includes("money") && (
                                <div className="bg-white p-3 rounded-lg shadow-xs border">
                                  <span className="font-medium text-teal-600">
                                    {selectedNeeds.targetMoney} ETB
                                  </span>{" "}
                                  financial support
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              What We Received
                            </h6>
                            {previewData.donations?.services &&
                              previewData.donations.services.length > 0 && (
                                <div className="mb-4">
                                  <h6 className="text-xs font-medium text-gray-500 mb-2">
                                    SERVICE DONATIONS
                                  </h6>
                                  <div className="space-y-3">
                                    {previewData.donations.services.map(
                                      (donation, index) => (
                                        <div
                                          key={index}
                                          className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs"
                                        >
                                          <h6 className="font-medium text-gray-800">
                                            {donation.applicant?.name ||
                                              "Anonymous"}
                                          </h6>
                                          <p className="text-sm text-gray-600">
                                            {donation.applicant?.email ||
                                              "No email provided"}
                                          </p>
                                          <div className="mt-2 flex justify-between text-xs">
                                            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded">
                                              {donation.category}
                                            </span>
                                            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded">
                                              {donation.subCategory}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {previewData.donations?.materials &&
                              previewData.donations.materials.length > 0 && (
                                <div>
                                  <h6 className="text-xs font-medium text-gray-500 mb-2">
                                    MATERIAL DONATIONS
                                  </h6>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {previewData.donations.materials.map(
                                      (donation, index) => (
                                        <div
                                          key={index}
                                          className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs"
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">
                                              {donation.subCategory}
                                            </span>
                                            <span className="text-teal-600 font-medium">
                                              {donation.totalQuantity}{" "}
                                              {donation.unit}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportForm;

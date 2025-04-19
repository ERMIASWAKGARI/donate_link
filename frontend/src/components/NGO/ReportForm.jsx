import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../config/axiosConfig";

const ReportForm = ({ selectedNeeds, onGenerate, clearSelection }) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch preview data automatically when selectedNeeds changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedNeeds?._id) return;
      console.log("Selected needs:", selectedNeeds);
      setLoadingPreview(true);
      try {
        const response = await axios.get(
          `donation/reportPreview/${selectedNeeds._id}`,
          {
            params: {
              needTypes: selectedNeeds.needTypes,
              needId: selectedNeeds._id,
            },
          }
        );

        console.log("Preview data response:", response.data);
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
  // Dependency on selectedNeeds

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("needId", selectedNeeds.id);
      images.forEach((file) => formData.append("images", file));

      const response = await axios.post("donation/generateReport", formData, {
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
    setImages([]);
    setShowPreview(false);
    clearSelection();
  };

  const handlePreviewClick = () => {
    if (canPreview) {
      setShowPreview(true);
    }
  };

  const canPreview = description.trim() !== "" && images.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md space-y-6"
      >
        {/* Form header */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Report for:{" "}
            <span className="text-teal-600">{selectedNeeds?.title}</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Please provide details about the donations received
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Describe the donations received and their impact..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images *
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-gray-50 transition">
                <div className="p-6 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    {images.length > 0
                      ? `${images.length} file(s) selected`
                      : "Click to upload images (max 10)"}
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
        </div>

        {/* Form buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handlePreviewClick}
            disabled={!canPreview || loadingPreview}
            className={`px-6 py-2 rounded-lg font-medium border ${
              canPreview
                ? "border-teal-600 text-teal-600 hover:bg-teal-50"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            } transition`}
          >
            {loadingPreview ? (
              <span className="flex items-center">
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
              </span>
            ) : (
              "Preview Report"
            )}
          </button>
          <button
            type="submit"
            disabled={!canPreview || isSubmitting}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Submitting..." : "Generate Report"}
          </button>
        </div>
      </form>

      {/* Preview Modal - Only shows when showPreview is true */}
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
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
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

                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        {selectedNeeds.title}
                      </h4>
                      <p className="text-gray-600">{description}</p>
                    </div>

                    {images.length > 0 && (
                      <div>
                        <h5 className="text-md font-medium text-gray-700 mb-2">
                          photograph of our impact
                        </h5>
                        <div className="grid grid-cols-3 gap-3">
                          {images.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewData && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="text-md font-medium text-gray-700 mb-3">
                            Donation Summary
                          </h5>

                          <div className="grid grid-cols-2 gap-4">
                            {selectedNeeds.needTypes.includes("service") &&
                              selectedNeeds.categories.service.map(
                                (category, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    We have requested for {category.vacancy}{" "}
                                    {category.subCategoryName}
                                  </div>
                                )
                              )}
                            {selectedNeeds.needTypes.includes("material") &&
                              selectedNeeds.categories.material.map(
                                (category, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    We have requested for{" "}
                                    {category.targetAmountNeeded}{" "}
                                    {category.subCategoryName}
                                  </div>
                                )
                              )}
                            {selectedNeeds.needTypes.includes("money") && (
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                We have requested for{" "}
                                {selectedNeeds.targetMoney} ETB
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <h1>our Result</h1>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Close Preview
                    </button>
                  </div>
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

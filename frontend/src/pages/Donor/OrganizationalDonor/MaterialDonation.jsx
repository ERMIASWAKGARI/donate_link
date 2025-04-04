import PropTypes from "prop-types";
import { useState } from "react";
import { FiChevronDown, FiX, FiCheck, FiEdit, FiLoader } from "react-icons/fi";
import FileUploader from "./FileUploader";
import LocationMap from "./LocationMap";

const MaterialDonation = ({
  formData,
  handleInputChange,
  handleSubmit,
  files,
  previewUrls,
  fileInputRef,
  handleFileChange,
  removeFile,
  mapCenter,
  setFormData,
  setMapCenter,
  materialCategories,
  isSubmitting,
  onCancel,
}) => {
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      materialDetails: {
        ...prev.materialDetails,
        category: value,
        subCategory: "",
        customCategory:
          value === "other" ? prev.materialDetails.customCategory : "",
        customSubCategory: "",
      },
    }));
    setShowCustomCategory(value === "other");
    setShowCustomSubCategory(false);
  };

  const handleSubCategoryChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      materialDetails: {
        ...prev.materialDetails,
        subCategory: value,
        customSubCategory:
          value === "Other" ? prev.materialDetails.customSubCategory : "",
      },
    }));
    setShowCustomSubCategory(value === "Other");
  };

  const handleCustomCategorySubmit = () => {
    if (!formData.materialDetails.customCategory.trim()) return;
    setShowCustomCategory(false);
  };

  const resetCategorySelection = () => {
    setShowCustomCategory(false);
    setFormData((prev) => ({
      ...prev,
      materialDetails: {
        ...prev.materialDetails,
        category: "",
        customCategory: "",
        subCategory: "",
        customSubCategory: "",
      },
    }));
  };

  const resetSubCategorySelection = () => {
    setShowCustomSubCategory(false);
    setFormData((prev) => ({
      ...prev,
      materialDetails: {
        ...prev.materialDetails,
        subCategory: "",
        customSubCategory: "",
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form Fields */}
        <div className="w-full lg:w-1/2">
          {/* Material Details Section */}
          <div className="p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Material Details
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title or Name
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter full title or name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {showCustomCategory ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="materialDetails.customCategory"
                      value={formData.materialDetails.customCategory}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Specify your category"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <button
                        type="button"
                        onClick={handleCustomCategorySubmit}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="Confirm"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={resetCategorySelection}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Cancel"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="materialDetails.category"
                      value={formData.materialDetails.category}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      required
                    >
                      <option value="">Select a category</option>
                      {Object.keys(materialCategories).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                      <option value="other">Other (specify)</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Subcategory Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                {showCustomSubCategory ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="materialDetails.customSubCategory"
                      value={formData.materialDetails.customSubCategory}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Specify your subcategory"
                      disabled={!formData.materialDetails.category}
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <button
                        type="button"
                        onClick={() => setShowCustomSubCategory(false)}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="Confirm"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={resetSubCategorySelection}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Cancel"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="materialDetails.subCategory"
                      value={formData.materialDetails.subCategory}
                      onChange={handleSubCategoryChange}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      required
                      disabled={!formData.materialDetails.category}
                    >
                      <option value="">Select a subcategory</option>
                      {formData.materialDetails.category &&
                        materialCategories[
                          formData.materialDetails.category
                        ]?.map((subCat) => (
                          <option key={subCat} value={subCat}>
                            {subCat}
                          </option>
                        ))}
                      <option value="Other">Other (specify)</option>
                    </select>
                    {formData.materialDetails.subCategory === "Other" && (
                      <button
                        type="button"
                        onClick={() => setShowCustomSubCategory(true)}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit custom subcategory"
                      >
                        <FiEdit size={16} />
                      </button>
                    )}
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="materialDetails.quantity"
                    value={formData.materialDetails.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <select
                    name="materialDetails.unit"
                    value={formData.materialDetails.unit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pieces">pieces</option>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="boxes">boxes</option>
                    <option value="pairs">pairs</option>
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  name="materialDetails.condition"
                  value={formData.materialDetails.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Expiration Date */}
              {(formData.materialDetails.category === "food" ||
                formData.materialDetails.category === "medical") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="materialDetails.expirationDate"
                    value={formData.materialDetails.expirationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide additional details about your donation..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* File Upload Section */}
          <div className="pt-1 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Upload Images
            </label>
            <FileUploader
              files={files}
              previewUrls={previewUrls}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              removeFile={removeFile}
            />
          </div>
        </div>

        {/* Right Column - Map Section */}
        <div className="w-full lg:w-1/2">
          <div className="p-6 rounded-lg h-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Location Details
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter full address"
              />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location from Map
            </label>
            <div className="h-[500px] rounded-md overflow-hidden border border-gray-300">
              <LocationMap
                mapCenter={mapCenter}
                setFormData={setFormData}
                setMapCenter={setMapCenter}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3  text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center min-w-32"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Donation"
          )}
        </button>
      </div>
    </form>
  );
};

MaterialDonation.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
  previewUrls: PropTypes.array.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  mapCenter: PropTypes.array.isRequired,
  setFormData: PropTypes.func.isRequired,
  setMapCenter: PropTypes.func.isRequired,
  materialCategories: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default MaterialDonation;

import PropTypes from "prop-types";
import { useState } from "react";
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
}) => {
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);

  const handleCategoryChange = (e) => {
    const { value } = e.target;

    if (value === "other") {
      setShowCustomCategory(true);
      setFormData((prev) => ({
        ...prev,
        materialDetails: {
          ...prev.materialDetails,
          category: "",
          subCategory: "",
        },
      }));
      setShowCustomSubCategory(false);
    } else {
      setShowCustomCategory(false);
      setShowCustomSubCategory(false);
      handleInputChange(e);
    }
  };

  const handleSubCategoryChange = (e) => {
    const { value } = e.target;

    if (value === "other") {
      setShowCustomSubCategory(true);
      setFormData((prev) => ({
        ...prev,
        materialDetails: {
          ...prev.materialDetails,
          subCategory: "",
        },
      }));
    } else {
      setShowCustomSubCategory(false);
      handleInputChange(e);
    }
  };

  const handleCustomInputChange = (e) => {
    handleInputChange(e);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form Fields */}
        <div className="w-full lg:w-1/2">
          {/* Material Details Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
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

            <div className="mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {showCustomCategory ? (
                  <input
                    type="text"
                    name="materialDetails.category"
                    value={formData.materialDetails.category}
                    onChange={handleCustomInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Specify your category"
                    autoFocus
                  />
                ) : (
                  <select
                    name="materialDetails.category"
                    value={formData.materialDetails.category}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                )}
              </div>

              {/* Subcategory Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                {showCustomSubCategory ? (
                  <input
                    type="text"
                    name="materialDetails.subCategory"
                    value={formData.materialDetails.subCategory}
                    onChange={handleCustomInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Specify your subcategory"
                    disabled={!formData.materialDetails.category}
                    autoFocus
                  />
                ) : (
                  <select
                    name="materialDetails.subCategory"
                    value={formData.materialDetails.subCategory}
                    onChange={handleSubCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <option value="other">Other (specify)</option>
                  </select>
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

          {/* File Upload Section */}
          <div className="bg-gray-50 pt-1 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Upload Images
            </h2>
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
          <div className="bg-gray-50 p-6 rounded-lg h-full">
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

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Submit Donation
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
};

export default MaterialDonation;

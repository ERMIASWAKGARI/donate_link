import PropTypes from "prop-types";
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="materialDetails.category"
                  value={formData.materialDetails.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(materialCategories).map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="materialDetails.subCategory"
                  value={formData.materialDetails.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formData.materialDetails.category}
                >
                  <option value="">Select a subcategory</option>
                  {formData.materialDetails.category &&
                    materialCategories[formData.materialDetails.category].map(
                      (subCat) => (
                        <option key={subCat} value={subCat}>
                          {subCat}
                        </option>
                      )
                    )}
                </select>
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

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 ">
                Description
              </label>
              <textarea
                name="materialDetails.description"
                value={formData.materialDetails.description}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide additional details about your donation..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.materialDetails.description.length}/500 characters
              </p>
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

      {/* Single Submit Button at the bottom */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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

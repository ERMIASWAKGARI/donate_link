import PropTypes from "prop-types";
import { FiLoader } from "react-icons/fi";
import FileUploader from "./FileUploader";
import LocationMap from "./LocationMap";

const OtherDonationForm = ({
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
  isSubmitting,
  onCancel,
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form Fields */}
        <div className="w-full lg:w-1/2">
          {/* Donation Details Section */}
          <div className="p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Donation Details
            </h2>

            <div className="mb-4">
              <label className="block text-sm justify-left font-medium text-gray-700 mb-2">
                Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter donation title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Describe your donation in detail"
              />
            </div>

            {/* File Upload Section */}
            <div className="pt-1">
              <label className="block text-sm font-medium mb-2">
                Upload Images (Max 5)
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
        </div>

        {/* Right Column - Location Section */}
        <div className="w-full lg:w-1/2">
          <div className="p-6 rounded-lg h-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Location Details
            </h2>
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address*
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
            </div> */}

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
      <div className="flex justify-center mt-4 space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center min-w-32"
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

OtherDonationForm.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    donationType: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    // address: PropTypes.string.isRequired,
    location: PropTypes.shape({
      type: PropTypes.string,
      coordinates: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
  }).isRequired,
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
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default OtherDonationForm;

// import React from 'react';
import PropTypes from "prop-types";

const DonationTypeSelector = ({ donationType, handleDonationTypeChange }) => {
  return (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => handleDonationTypeChange("material")}
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          donationType === "material"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Material Donation
      </button>
      {/* <button
        onClick={() => handleDonationTypeChange("money")}
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          donationType === "money"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Money Donation
      </button>

      <button
        onClick={() => handleDonationTypeChange("service")}
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          donationType === "service"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Service Donation
      </button> */}
      <button
        onClick={() => handleDonationTypeChange("others")}
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          donationType === "others"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Other Donations
      </button>
    </div>
  );
};

DonationTypeSelector.propTypes = {
  donationType: PropTypes.oneOf(["money", "material", "service", "others"])
    .isRequired,
  handleDonationTypeChange: PropTypes.func.isRequired,
};

export default DonationTypeSelector;

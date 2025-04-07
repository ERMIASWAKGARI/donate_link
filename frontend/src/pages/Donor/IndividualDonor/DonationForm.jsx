import { useState } from "react";
import axios from "axios";

const DonationForm = ({ need, onSubmit, currentUser }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Initialize form data based on need types
  const [formData, setFormData] = useState({
    type: need.needTypes.includes("money") ? "money" : need.needTypes[0],
    amount: "",
    materials:
      need.categories.material?.map((item) => ({
        categoryName: item.categoryName,
        subCategoryName: item.subCategoryName,
        quantity: "",
      })) || [],
    services:
      need.categories.service?.map((item) => ({
        categoryName: item.categoryName,
        subCategoryName: item.subCategoryName,
        commitment: "",
        motivation: "",
        startDate: "",
        endDate: "",
        hoursPerWeek: "",
      })) || [],
    message: "",
    location: {
      address: "",
      latitude: null,
      longitude: null,
    },
    pictures: [],
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle material donation changes
  const handleMaterialChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index][name] = value;
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  // Handle service donation changes
  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedServices = [...formData.services];
    updatedServices[index][name] = value;
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  // Handle location changes
  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    }));
  };

  // Handle file uploads
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.pictures.length > 10) {
      setError("You can upload a maximum of 10 pictures");
      return;
    }

    try {
      // In a real implementation, you would upload files to your server here
      // For demo purposes, we'll just use the file names
      const uploadedUrls = files.map((file) => URL.createObjectURL(file));

      setFormData((prev) => ({
        ...prev,
        pictures: [...prev.pictures, ...uploadedUrls],
      }));
    } catch (err) {
      setError("Failed to upload pictures");
    }
  };

  // Remove a picture
  const removePicture = (index) => {
    setFormData((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  // Validate date range
  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      return new Date(startDate) < new Date(endDate);
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!currentUser || !currentUser.id) {
        throw new Error("You must be logged in to make a donation");
      }

      if (formData.type === "money" && !formData.amount) {
        throw new Error("Please enter an amount");
      }

      if (formData.type === "material") {
        for (const material of formData.materials) {
          if (!material.quantity) {
            throw new Error("Please fill all material quantities");
          }
        }
        if (!formData.location.address) {
          throw new Error("Please provide a location for material donation");
        }
      }

      if (formData.type === "service") {
        for (const service of formData.services) {
          if (!service.commitment) {
            throw new Error("Please fill all service commitments");
          }
          if (!service.motivation) {
            throw new Error("Please provide your motivation for each service");
          }
          if (!service.startDate || !service.endDate) {
            throw new Error(
              "Please provide start and end dates for each service"
            );
          }
          if (!validateDates(service.startDate, service.endDate)) {
            throw new Error(
              "End date must be after start date for each service"
            );
          }
          if (
            !service.hoursPerWeek ||
            isNaN(service.hoursPerWeek) ||
            service.hoursPerWeek <= 0
          ) {
            throw new Error(
              "Please provide valid hours per week for each service"
            );
          }
        }
      }

      // Prepare donation data
      const donationData = {
        NGO: need.NGO,
        donorId: currentUser.id,
        needId: need._id,
        donationType: formData.type,
        message: formData.message,
      };

      // Add type-specific data
      if (formData.type === "money") {
        donationData.amount = parseFloat(formData.amount);
      } else if (formData.type === "material") {
        donationData.materials = formData.materials.map((m) => ({
          categoryName: m.categoryName,
          subCategoryName: m.subCategoryName,
          quantity: parseInt(m.quantity),
        }));
        donationData.location = formData.location;
        donationData.pictures = formData.pictures;
      } else if (formData.type === "service") {
        donationData.services = formData.services.map((s) => ({
          categoryName: s.categoryName,
          subCategoryName: s.subCategoryName,
          commitment: s.commitment,
          motivation: s.motivation,
          startDate: s.startDate,
          endDate: s.endDate,
          hoursPerWeek: parseInt(s.hoursPerWeek),
        }));
      }

      // In a real implementation, you would submit to your API here
      console.log("Submitting donation:", donationData);

      setSuccess("Donation submitted successfully!");
      if (onSubmit) onSubmit(donationData);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          type: need.needTypes.includes("money") ? "money" : need.needTypes[0],
          amount: "",
          materials:
            need.categories.material?.map((item) => ({
              categoryName: item.categoryName,
              subCategoryName: item.subCategoryName,
              quantity: "",
            })) || [],
          services:
            need.categories.service?.map((item) => ({
              categoryName: item.categoryName,
              subCategoryName: item.subCategoryName,
              commitment: "",
              motivation: "",
              startDate: "",
              endDate: "",
              hoursPerWeek: "",
            })) || [],
          message: "",
          location: {
            address: "",
            latitude: null,
            longitude: null,
          },
          pictures: [],
        });
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Make a Donation
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Donation Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Donation Type</label>
          <div className="space-y-2">
            {need.needTypes.includes("money") && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="money"
                  checked={formData.type === "money"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Monetary Donation
              </label>
            )}
            {need.needTypes.includes("material") && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="material"
                  checked={formData.type === "material"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Material Donation
              </label>
            )}
            {need.needTypes.includes("service") && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="service"
                  checked={formData.type === "service"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Service Donation
              </label>
            )}
          </div>
        </div>

        {/* Money Donation Form */}
        {formData.type === "money" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full p-2 border rounded"
              required
            />
            {need.targetMoney && (
              <p className="text-sm text-gray-500 mt-1">
                Target: ${need.targetMoney.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Material Donation Form */}
        {formData.type === "material" && formData.materials.length > 0 && (
          <>
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Material Items</h4>
              <div className="space-y-3">
                {formData.materials.map((item, index) => (
                  <div key={index} className="border p-3 rounded">
                    <p className="font-medium">
                      {item.categoryName} - {item.subCategoryName}
                    </p>
                    <div className="mt-2">
                      <label className="block text-sm text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleMaterialChange(index, e)}
                        min="1"
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location for Material Donation */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Pickup/Drop-off Location
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) =>
                  handleLocationChange({
                    ...formData.location,
                    address: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Enter full address"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        handleLocationChange({
                          ...formData.location,
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                        });
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                        setError("Could not get your current location");
                      }
                    );
                  } else {
                    setError("Geolocation is not supported by your browser");
                  }
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Use Current Location
              </button>
            </div>

            {/* Pictures for Material Donation */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Upload Pictures (Max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
                disabled={formData.pictures.length >= 10}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.pictures.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Donation ${index}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePicture(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {formData.pictures.length >= 10 && (
                <p className="text-sm text-red-500 mt-1">
                  Maximum 10 pictures reached
                </p>
              )}
            </div>
          </>
        )}

        {/* Service Donation Form */}
        {formData.type === "service" && formData.services.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Service Items</h4>
            <div className="space-y-3">
              {formData.services.map((item, index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium">
                    {item.categoryName} - {item.subCategoryName}
                  </p>
                  <div className="mt-2 space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Your Commitment
                      </label>
                      <textarea
                        name="commitment"
                        value={item.commitment}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="w-full p-2 border rounded"
                        rows="3"
                        required
                        placeholder="Describe how you can help with this service..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Motivation
                      </label>
                      <textarea
                        name="motivation"
                        value={item.motivation}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="w-full p-2 border rounded"
                        rows="2"
                        required
                        placeholder="Why do you want to provide this service?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={item.startDate}
                          onChange={(e) => handleServiceChange(index, e)}
                          className="w-full p-2 border rounded"
                          required
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={item.endDate}
                          onChange={(e) => handleServiceChange(index, e)}
                          className="w-full p-2 border rounded"
                          required
                          min={
                            item.startDate ||
                            new Date().toISOString().split("T")[0]
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Hours Per Week
                      </label>
                      <input
                        type="number"
                        name="hoursPerWeek"
                        value={item.hoursPerWeek}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="w-full p-2 border rounded"
                        min="1"
                        max="168" // 24*7
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Message (Optional)</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Add any additional information about your donation..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Donation"}
        </button>
      </form>
    </div>
  );
};

export default DonationForm;

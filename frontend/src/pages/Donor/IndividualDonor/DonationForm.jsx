import { useState, useContext } from "react";

import Axios from "../../../config/axiosConfig";
import MaterialDonationForm from "./MatterialDonationForm";
import { UserContext } from "../../../context/UserContext";
const DonationForm = ({ need, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(UserContext);
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

  // Handle form submission// Update your handleSubmit function in DonationForm.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!user) {
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

      // Submit based on donation type
      let response;
      if (formData.type === "money") {
        response = await axios.post("/api/donations/money", {
          NGO: need.NGO,
          donorId: user._id,
          needId: need._id,
          amount: parseFloat(formData.amount),
          message: formData.message || "",
        });
      } else if (formData.type === "material") {
        const formDataToSend = new FormData();
        formDataToSend.append("NGO", need.NGO);
        formDataToSend.append("donorId", user._id);
        formDataToSend.append("needId", need._id);
        formDataToSend.append("message", formData.message || "");
        formDataToSend.append(
          "materials",
          JSON.stringify(
            formData.materials.map((m) => ({
              categoryName: m.categoryName,
              subCategoryName: m.subCategoryName,
              quantity: parseInt(m.quantity),
            }))
          )
        );
        formDataToSend.append(
          "location",
          JSON.stringify({
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
            address: formData.location.address,
          })
        );

        // Handle file uploads
        if (formData.pictures.length > 0) {
          const pictureFiles = await Promise.all(
            formData.pictures.map(async (pic) => {
              if (pic.startsWith("data:")) {
                const response = await fetch(pic);
                const blob = await response.blob();
                return new File([blob], `donation-${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });
              }
              return pic;
            })
          );

          pictureFiles.forEach((file) => {
            formDataToSend.append("pictures", file);
          });
        }

        response = await Axios.post("/api/donations/material", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (formData.type === "service") {
        response = await Axios.post("/donation/service", {
          NGO: need.NGO,
          donorId: user._id,
          needId: need._id,
          services: formData.services.map((s) => ({
            categoryName: s.categoryName,
            subCategoryName: s.subCategoryName,
            commitment: s.commitment,
            motivation: s.motivation,
            startDate: s.startDate,
            endDate: s.endDate,
            hoursPerWeek: parseInt(s.hoursPerWeek),
          })),
          message: formData.message || "",
        });
      }

      setSuccess(response?.data?.message || "Donation submitted successfully!");
      if (onSubmit) onSubmit(response?.data?.donation || formData);

      // Reset form
      setTimeout(() => {
        setFormData({
          // ... reset form data ...
        });
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
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
          <MaterialDonationForm
            materials={formData.materials}
            location={formData.location}
            onMaterialChange={handleMaterialChange}
            onLocationChange={handleLocationChange}
            handleFileUpload={handleFileUpload}
            removePicture={removePicture}
            formData={formData}
          />
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

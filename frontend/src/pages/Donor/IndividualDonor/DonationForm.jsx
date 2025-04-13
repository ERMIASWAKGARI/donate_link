import { useState, useContext } from "react";
import {
  FaHandHoldingHeart,
  FaMoneyBillWave,
  FaBoxOpen,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import Axios from "../../../config/axiosConfig";
import MaterialDonationForm from "./MatterialDonationForm";
import { UserContext } from "../../../context/UserContext";
const DonationForm = ({ need, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(UserContext);
  // Initialize form data based on need types
  console.log("need", need);
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
        response = await Axios.post("/donation/money", {
          NGO: need.NGO._id,
          donorId: user._id,
          needId: need._id,
          amount: parseFloat(formData.amount),
          message: formData.message || "",
        });
      } else if (formData.type === "material") {
        const formDataToSend = new FormData();
        formDataToSend.append("NGO", need.NGO._id);
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

        response = await Axios.post("donation/material", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (formData.type === "service") {
        response = await Axios.post("/donation/service", {
          NGO: need?.NGO?._id,
          donorId: user?._id,
          needId: need?._id,
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-primary p-4 text-white">
        <h3 className="text-xl font-bold flex items-center">
          <FaHandHoldingHeart className="mr-2" />
          Make a Donation
        </h3>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Donation Type Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Donation Type
            </label>
            <div className="space-y-3">
              {need.needTypes.includes("money") && (
                <label className="flex items-center p-3 border rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="money"
                    checked={formData.type === "money"}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 text-primary"
                  />
                  <div>
                    <div className="flex items-center font-medium">
                      <FaMoneyBillWave className="mr-2 text-primary" />
                      Monetary Donation
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Contribute financially to this cause
                    </p>
                  </div>
                </label>
              )}
              {need?.needTypes.includes("material") && (
                <label className="flex items-center p-3 border rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="material"
                    checked={formData.type === "material"}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 text-primary"
                  />
                  <div>
                    <div className="flex items-center font-medium">
                      <FaBoxOpen className="mr-2 text-primary" />
                      Material Donation
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Donate physical items needed
                    </p>
                  </div>
                </label>
              )}
              {need.needTypes.includes("service") && (
                <label className="flex items-center p-3 border rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="service"
                    checked={formData.type === "service"}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 text-primary"
                  />
                  <div>
                    <div className="flex items-center font-medium">
                      <FaClock className="mr-2 text-primary" />
                      Service Donation
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Volunteer your time and skills
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Money Donation Form */}
          {formData.type === "money" && (
            <div className="mb-6 bg-primary/10 p-4 rounded-lg">
              <label className="block text-gray-700 font-medium mb-2">
                Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className="w-full pl-8 p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  placeholder="Enter amount"
                />
              </div>
              {need.targetMoney && (
                <p className="text-sm text-gray-600 mt-2">
                  Target:{" "}
                  <span className="font-semibold">
                    ${need.targetMoney.toLocaleString()}
                  </span>
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
          {formData.type === "service" && formData.services?.length > 0 && (
            <div className="mb-6 space-y-4">
              <h4 className="font-medium text-gray-700 mb-2">Service Items</h4>
              {formData.services.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <p className="font-medium text-primary">
                    {item.categoryName} - {item.subCategoryName}
                  </p>
                  <div className="mt-3 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivation
                      </label>
                      <textarea
                        name="motivation"
                        value={item.motivation}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        rows="3"
                        required
                        placeholder="Why do you want to provide this service?"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-500" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={item.startDate}
                          onChange={(e) => handleServiceChange(index, e)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          required
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-500" />
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={item.endDate}
                          onChange={(e) => handleServiceChange(index, e)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          required
                          min={
                            item.startDate ||
                            new Date().toISOString().split("T")[0]
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaClock className="mr-2 text-gray-500" />
                        Hours Per Week
                      </label>
                      <input
                        type="number"
                        name="hoursPerWeek"
                        value={item.hoursPerWeek}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        min="1"
                        max="168"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              rows="3"
              placeholder="Add any additional information about your donation..."
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${
              isSubmitting
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary-button hover:bg-yellow-400"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Processing...
              </span>
            ) : (
              "Submit Donation"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;

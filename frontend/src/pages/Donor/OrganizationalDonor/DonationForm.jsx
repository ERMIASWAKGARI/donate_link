import { useState, useRef, useEffect } from "react";
import DonationTypeSelector from "./DonationTypeSelector";
import { FiAlertTriangle } from "react-icons/fi";
import MaterialDonation from "./MaterialDonation";
import { showToast } from "./ToastNotification";
import ToastNotifications from "./ToastNotification";
import OtherDonationPage from "./OtherDonationPage";
import Header from "../../../components/header/Header";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axiosConfig"; // Use your configured axios instance

const materialCategories = {
  food: ["Grains", "Canned Goods", "Fresh Produce", "Dairy", "Baked Goods"],
  medical: [
    "Medicines",
    "First Aid Kits",
    "Medical Equipment",
    "PPE",
    "Sanitation",
  ],
  learning: [
    "Books",
    "Stationery",
    "Electronics",
    "School Uniforms",
    "Backpacks",
  ],
  drinking: ["Bottled Water", "Water Filters", "Water Purification Tablets"],
  clothing: ["Adult Clothing", "Children Clothing", "Shoes", "Winter Gear"],
};

const DonationForm = () => {
  const [donationType, setDonationType] = useState("material");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    materialDetails: {
      category: "",
      customCategory: "",
      subCategory: "",
      customSubCategory: "",
      quantity: 1,
      unit: "pieces",
      condition: "new",
      expirationDate: "",
    },
    address: {
      country: "Ethiopia", // Default value
      region: "",
      city: "",
      street: "",
    },
    location: {
      type: "Point",
      coordinates: [38.7636, 8.9806], // Default to Addis Ababa
    },
  });
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([8.9806, 38.7636]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get donor ID from token
  const getDonorIdFromToken = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      showToast.warning("Session expired. Please login again.");
      return null;
    }
    try {
      const payload = accessToken.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.id;
    } catch {
      showToast.error("Invalid session. Please login again.");
      return null;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
          ...(parent === "materialDetails" &&
          child === "category" &&
          value !== "other"
            ? { customCategory: "" }
            : {}),
          ...(parent === "materialDetails" &&
          child === "subCategory" &&
          value !== "Other"
            ? { customSubCategory: "" }
            : {}),
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5 - files.length);
    const newPreviewUrls = selectedFiles.map(URL.createObjectURL);

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Remove a file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Form validation
  const validateForm = () => {
    // Required fields validation
    if (!formData.title.trim()) {
      showToast.error("Title is required");
      return false;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      showToast.error("Description must be at least 20 characters");
      return false;
    }

    // Material details validation
    if (!formData.materialDetails.category) {
      showToast.error("Category is required");
      return false;
    }

    if (
      formData.materialDetails.category === "other" &&
      !formData.materialDetails.customCategory
    ) {
      showToast.error("Custom category is required");
      return false;
    }

    if (!formData.materialDetails.subCategory) {
      showToast.error("Subcategory is required");
      return false;
    }

    if (
      formData.materialDetails.subCategory === "Other" &&
      !formData.materialDetails.customSubCategory
    ) {
      showToast.error("Custom subcategory is required");
      return false;
    }

    if (formData.materialDetails.quantity <= 0) {
      showToast.error("Quantity must be greater than 0");
      return false;
    }

    // Address validation
    if (
      !formData.address.country ||
      !formData.address.region ||
      !formData.address.city
    ) {
      showToast.error("Country, region, and city are required");
      return false;
    }

    // Location validation
    if (
      !formData.location.coordinates ||
      formData.location.coordinates.length !== 2 ||
      formData.location.coordinates.some((coord) => isNaN(coord))
    ) {
      showToast.error("Please select a valid location on the map");
      return false;
    }

    // Expiration date for food/medical
    if (
      (formData.materialDetails.category === "food" ||
        formData.materialDetails.category === "medical") &&
      !formData.materialDetails.expirationDate
    ) {
      showToast.error("Expiration date is required for this category");
      return false;
    }

    // Files validation
    if (files.length === 0) {
      showToast.error("Please upload at least one image");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = showToast.loading("Submitting donation...");

    try {
      const donorId = getDonorIdFromToken();
      if (!donorId) return;

      const formDataToSend = new FormData();
      files.forEach((file) => formDataToSend.append("files", file));

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        donorId,
        donationType: "material",
        materialDetails: {
          category:
            formData.materialDetails.category === "other"
              ? formData.materialDetails.customCategory
              : formData.materialDetails.category,
          subCategory:
            formData.materialDetails.subCategory === "Other"
              ? formData.materialDetails.customSubCategory
              : formData.materialDetails.subCategory,
          quantity: Number(formData.materialDetails.quantity),
          unit: formData.materialDetails.unit,
          condition: formData.materialDetails.condition,
          ...(formData.materialDetails.expirationDate && {
            expirationDate: new Date(formData.materialDetails.expirationDate),
          }),
        },
        address: {
          country: formData.address.country,
          region: formData.address.region,
          city: formData.address.city,
          ...(formData.address.street && { street: formData.address.street }),
        },
        location: {
          type: "Point",
          coordinates: formData.location.coordinates.map(Number),
        },
      };

      formDataToSend.append("data", JSON.stringify(payload));

      const response = await axios.post(
        "/organization/material",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      showToast.success("Donation submitted successfully!");
      resetForm();
      navigate("/donor/dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      showToast.error(
        error.response?.data?.message ||
          "Failed to submit donation. Please try again."
      );
    } finally {
      showToast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      materialDetails: {
        category: "",
        customCategory: "",
        subCategory: "",
        customSubCategory: "",
        quantity: 1,
        unit: "pieces",
        condition: "new",
        expirationDate: "",
      },
      address: {
        country: "",
        region: "",
        city: "",
      },
      location: {
        type: "Point",
        coordinates: [38.7636, 8.9806],
      },
    });
    setFiles([]);
    setPreviewUrls([]);
  };

  // Clean up object URLs
  useEffect(() => {
    return () => previewUrls.forEach(URL.revokeObjectURL);
  }, [previewUrls]);

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full z-1010 bg-white shadow-md">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto p-6 pt-32 bg-white rounded-lg shadow-md relative">
        <DonationTypeSelector
          donationType={donationType}
          handleDonationTypeChange={setDonationType}
        />
        <ToastNotifications />

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-1 rounded-r-md">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Important Notice
              </h3>
              <p className="mt-2 text-sm text-amber-700">
                Please review all information carefully before submitting.
                <span className="font-semibold">
                  {" "}
                  Donations cannot be edited
                </span>{" "}
                after submission.
              </p>
            </div>
          </div>
        </div>

        {donationType === "material" ? (
          <MaterialDonation
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            files={files}
            previewUrls={previewUrls}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            mapCenter={mapCenter}
            setFormData={setFormData}
            setMapCenter={setMapCenter}
            materialCategories={materialCategories}
            isSubmitting={isSubmitting}
            onCancel={() => {
              resetForm();
              navigate("/donor/dashboard");
            }}
          />
        ) : (
          <OtherDonationPage />
        )}
      </div>
    </div>
  );
};

export default DonationForm;

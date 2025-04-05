import { useState, useRef, useEffect } from "react";
import DonationTypeSelector from "./DonationTypeSelector";
import { FiAlertTriangle } from "react-icons/fi";
import MaterialDonation from "./MaterialDonation";
import { showToast } from "./ToastNotification";
import ToastNotifications from "./ToastNotification";
import OtherDonationPage from "./OtherDonationPage";
import { useNavigate } from "react-router-dom";

const materialCategories = {
  food: [
    "Grains",
    "Canned Goods",
    "Fresh Produce",
    "Dairy",
    "Baked Goods",
    // "Other",
  ],
  medical: [
    "Medicines",
    "First Aid Kits",
    "Medical Equipment",
    "PPE",
    "Sanitation",
    // "Other",
  ],
  learning: [
    "Books",
    "Stationery",
    "Electronics",
    "School Uniforms",
    "Backpacks",
    // "Other",
  ],
  drinking: [
    "Bottled Water",
    "Water Filters",
    "Water Purification Tablets",
    // "Other",
  ],
  clothing: [
    "Adult Clothing",
    "Children Clothing",
    "Shoes",
    "Winter Gear",
    // "Other",
  ],
  // other: ["Other"],
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
    address: "",
    location: {
      type: "Point",
      coordinates: [38.7636, 8.9806],
    },
  });
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([8.9806, 38.7636]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDonorIdFromToken = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      showToast.warning("Session expired. Please login again.");
      return null;
    }

    try {
      const payload = accessToken.split(".")[1];
      const decodedPayload = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      return decodedPayload.id;
    } catch {
      showToast.error("Invalid session. Please login again.");
      return null;
    }
  };

  const handleDonationTypeChange = (type) => {
    setDonationType(type);
    if (type !== "material") {
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
        address: "",
        location: {
          type: "Point",
          coordinates: [38.7636, 8.9806],
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));

      if (parent === "materialDetails") {
        if (child === "category" && value !== "other") {
          setFormData((prev) => ({
            ...prev,
            materialDetails: {
              ...prev.materialDetails,
              customCategory: "",
            },
          }));
        }
        if (child === "subCategory" && value !== "Other") {
          setFormData((prev) => ({
            ...prev,
            materialDetails: {
              ...prev.materialDetails,
              customSubCategory: "",
            },
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    URL.revokeObjectURL(previewUrls[index]);
  };

  const handleCancel = () => {
    // Reset form state
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
      address: "",
      location: {
        type: "Point",
        coordinates: [38.7636, 8.9806],
      },
    });
    setFiles([]);
    setPreviewUrls([]);
    // If using React Router, you could navigate away:
    navigate("/donor/dashboard");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showToast.error("Please enter a title for your donation");
      return false;
    }
    if (!formData.description.trim()) {
      showToast.error("Please provide a description");
      return false;
    }
    if (!formData.materialDetails.category) {
      showToast.error("Please select a category");
      return false;
    }
    if (
      formData.materialDetails.category === "other" &&
      !formData.materialDetails.customCategory.trim()
    ) {
      showToast.error("Please specify your custom category");
      return false;
    }
    if (!formData.materialDetails.subCategory) {
      showToast.error("Please select a subcategory");
      return false;
    }
    if (
      formData.materialDetails.subCategory === "Other" &&
      !formData.materialDetails.customSubCategory.trim()
    ) {
      showToast.error("Please specify your custom subcategory");
      return false;
    }
    if (!formData.address.trim()) {
      showToast.error("Please enter an address");
      return false;
    }
    if (files.length === 0) {
      showToast.error("Please upload at least one image");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = showToast.loading("Submitting your donation...");

    try {
      const donorId = getDonorIdFromToken();
      if (!donorId) {
        showToast.dismiss(loadingToast);
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      files.forEach((file) => formDataToSend.append("files", file));

      const payload = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
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
          quantity: formData.materialDetails.quantity,
          unit: formData.materialDetails.unit,
          condition: formData.materialDetails.condition,
          ...(formData.materialDetails.expirationDate && {
            expirationDate: formData.materialDetails.expirationDate,
          }),
        },
        location: formData.location,
      };

      formDataToSend.append("data", JSON.stringify(payload));
      formDataToSend.append("longitude", formData.location.coordinates[0]);
      formDataToSend.append("latitude", formData.location.coordinates[1]);

      const response = await fetch(
        "http://localhost:5000/api/organization/material",
        {
          method: "POST",
          body: formDataToSend,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      showToast.dismiss(loadingToast);
      setIsSubmitting(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process your donation");
      }

      const data = await response.json();
      showToast.success(
        data.message ||
          "Donation submitted successfully! Our team will review it shortly."
      );

      // Reset form
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
        address: "",
        location: {
          type: "Point",
          coordinates: [38.7636, 8.9806],
        },
      });
      setFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      showToast.dismiss(loadingToast);
      setIsSubmitting(false);

      if (error.message.includes("network")) {
        showToast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        showToast.error(
          error.message || "An unexpected error occurred. Please try again."
        );
      }

      // Clean up files
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
      <ToastNotifications />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h1>
      {/* Important Notice Banner */}

      <DonationTypeSelector
        donationType={donationType}
        handleDonationTypeChange={handleDonationTypeChange}
      />

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Important Notice
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Please review all information carefully before submitting.
                <span className="font-semibold">
                  {" "}
                  Donations cannot be edited
                </span>{" "}
                after submission. Ensure all details are accurate, especially:
              </p>
            </div>
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
          onCancel={handleCancel}
        />
      ) : (
        <div className="text-center py-12">
          <OtherDonationPage />
        </div>
      )}
    </div>
  );
};

export default DonationForm;

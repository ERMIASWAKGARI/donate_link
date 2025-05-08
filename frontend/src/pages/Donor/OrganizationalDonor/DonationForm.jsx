import { useState, useRef, useEffect } from "react";
import DonationTypeSelector from "./DonationTypeSelector";
import { FiAlertTriangle } from "react-icons/fi";
import MaterialDonation from "./MaterialDonation";
import { showToast } from "./ToastNotification";
import ToastNotifications from "./ToastNotification";
import OtherDonationPage from "./OtherDonationPage";
import Header from "../../../components/header/Header";
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
    address: {
      country: "",
      region: "",
      city: "",
      // Optional if you need more specific address
    },
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
    navigate("/donor/dashboard");
  };

  const validateForm = () => {
    // Title validation
    if (!formData.title.trim()) {
      showToast.error("Please enter a title for your donation");
      return false;
    }
    if (formData.title.trim().length < 5) {
      showToast.error("Title must be at least 5 characters long");
      return false;
    }

    // Description validation
    if (!formData.description.trim()) {
      showToast.error("Please provide a description");
      return false;
    }
    if (formData.description.trim().length < 20) {
      showToast.error("Description must be at least 20 characters long");
      return false;
    }

    // Category validation
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
    if (
      formData.materialDetails.category === "other" &&
      formData.materialDetails.customCategory.trim().length < 3
    ) {
      showToast.error("Custom category must be at least 3 characters");
      return false;
    }

    // Subcategory validation
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
    if (
      formData.materialDetails.subCategory === "Other" &&
      formData.materialDetails.customSubCategory.trim().length < 3
    ) {
      showToast.error("Custom subcategory must be at least 3 characters");
      return false;
    }

    // Quantity validation
    if (
      isNaN(formData.materialDetails.quantity) ||
      formData.materialDetails.quantity <= 0
    ) {
      showToast.error("Please enter a valid quantity (greater than 0)");
      return false;
    }

    // Address validation
    if (!formData.address.country) {
      showToast.error("Please select a country");
      return false;
    }
    if (!formData.address.region || formData.address.region.trim().length < 2) {
      showToast.error(
        "Please enter a valid region/state (at least 2 characters)"
      );
      return false;
    }
    if (!formData.address.city || formData.address.city.trim().length < 2) {
      showToast.error("Please enter a valid city (at least 2 characters)");
      return false;
    }

    // Location validation
    if (
      !formData.location ||
      !formData.location.coordinates ||
      formData.location.coordinates.length !== 2
    ) {
      showToast.error("Please select a valid location from the map");
      return false;
    }

    // Files validation
    if (files.length === 0) {
      showToast.error("Please upload at least one image");
      return false;
    }
    if (files.length > 5) {
      showToast.error("You can upload a maximum of 5 images");
      return false;
    }

    // Expiration date validation for perishable items
    if (
      (formData.materialDetails.category === "food" ||
        formData.materialDetails.category === "medical") &&
      !formData.materialDetails.expirationDate
    ) {
      showToast.error("Please provide an expiration date for this category");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showToast.loading("Submitting your donation...");

    try {
      const donorId = getDonorIdFromToken();
      if (!donorId) {
        showToast.dismiss(loadingToast);
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add files
      files.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Prepare the donation payload
      const payload = {
        materialDetails: {
          category: formData.materialDetails.category,
          ...(formData.materialDetails.category === "other" && {
            customCategory: formData.materialDetails.customCategory,
          }),
          subCategory: formData.materialDetails.subCategory,
          ...(formData.materialDetails.subCategory === "Other" && {
            customSubCategory: formData.materialDetails.customSubCategory,
          }),
          quantity: Number(formData.materialDetails.quantity),
          unit: formData.materialDetails.unit,
          condition: formData.materialDetails.condition,
          ...(formData.materialDetails.expirationDate && {
            expirationDate: formData.materialDetails.expirationDate,
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
          coordinates: [
            Number(formData.location.coordinates[0]),
            Number(formData.location.coordinates[1]),
          ],
        },
        title: formData.title,
        description: formData.description,
      };

      formDataToSend.append("data", JSON.stringify(payload));

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process your donation");
      }

      // Show success message and clear form
      showToast.dismiss(loadingToast);
      showToast.success("Donation submitted successfully!");

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
        address: {
          country: "",
          region: "",
          city: "",
          street: "",
        },
        location: {
          type: "Point",
          coordinates: [38.7636, 8.9806],
        },
      });
      setFiles([]);
      setPreviewUrls([]);
      setIsSubmitting(false);

      // Wait 2 seconds before navigating
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/donor/dashboard");
    } catch (error) {
      showToast.dismiss(loadingToast);
      setIsSubmitting(false);
      showToast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="relative">
      {/* Full-width Header */}
      <div className="fixed top-0 left-0 w-full z-1010 bg-white shadow-md">
        <Header />
      </div>

      {/* Add padding-top so your content doesn't go under the header */}
      <div className="max-w-7xl mx-auto p-6 pt-32 bg-white rounded-lg shadow-md relative">
        <DonationTypeSelector
          donationType={donationType}
          handleDonationTypeChange={handleDonationTypeChange}
        />
        <ToastNotifications />

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-1 rounded-r-md">
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

        {/* Content Switch */}
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
          <div className="text-center py-2">
            <OtherDonationPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationForm;

import { useState, useRef, useEffect } from "react";
import { showToast } from "./ToastNotification";
import ToastNotifications from "./ToastNotification";
import { useNavigate } from "react-router-dom";
import OtherDonationForm from "./OtherFormDonation";

const OtherDonationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    donationType: "other",
    description: "",
    address: "",
    location: {
      type: "Point",
      coordinates: [38.7636, 8.9806], // Default coordinates
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      donationType: "other",
      description: "",
      address: "",
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
    if (!formData.title.trim()) {
      showToast.error("Please enter a title for your donation");
      return false;
    }
    if (!formData.donationType.trim()) {
      showToast.error("Please select a donation type");
      return false;
    }
    if (!formData.description.trim()) {
      showToast.error("Please provide a description");
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
        ...formData,
        donorId,
        status: "pending",
      };

      formDataToSend.append("data", JSON.stringify(payload));
      formDataToSend.append("longitude", formData.location.coordinates[0]);
      formDataToSend.append("latitude", formData.location.coordinates[1]);

      const response = await fetch(
        "http://localhost:5000/api/organization/non-material",
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

      //   const data = await response.json();
      showToast.success("Donation submitted successfully!");

      // Reset form
      setFormData({
        title: "",
        donationType: "",
        description: "",
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
      showToast.error(error.message || "An unexpected error occurred");
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="max-w-7xl mx-auto  bg-white rounded-lg shadow-md relative">
      <ToastNotifications />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Other Donation Form
      </h1>

      <OtherDonationForm
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
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default OtherDonationPage;

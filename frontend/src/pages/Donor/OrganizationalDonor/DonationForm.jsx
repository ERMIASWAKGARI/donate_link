import { useState, useRef, useEffect } from "react";
import DonationTypeSelector from "./DonationTypeSelector";
import MaterialDonation from "./MaterialDonation";

// Category and subcategory data
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
  other: ["Furniture", "Household Items", "Toys", "Other"],
};

const DonationForm = () => {
  const [donationType, setDonationType] = useState("material");
  const [formData, setFormData] = useState({
    description: "", // Moved to root level
    materialDetails: {
      category: "",
      subCategory: "",
      quantity: 1,
      unit: "pieces",
      condition: "new",
      expirationDate: "",
    },
    address: "",
    title: "",
    location: {
      type: "Point",
      coordinates: [38.7636, 8.9806],
    },
  });
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([8.9806, 38.7636]);

  // Function to get donorId from accessToken
  const getDonorIdFromToken = () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Token:", accessToken);
    if (!accessToken) {
      console.error("No access token found");
      return null;
    }

    try {
      const payload = accessToken.split(".")[1];
      const decodedPayload = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      console.log("Decoded token payload:", decodedPayload);
      return decodedPayload.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const handleDonationTypeChange = (type) => {
    setDonationType(type);
    if (type !== "material") {
      setFormData({
        description: "",
        materialDetails: {
          category: "",
          subCategory: "",
          quantity: 1,
          unit: "pieces",
          condition: "new",
          expirationDate: "",
        },
        address: "",
        title: "",
        location: {
          type: "Point",
          coordinates: [38.7636, 8.9806],
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    }
    // Handle root-level fields
    else {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const donorId = getDonorIdFromToken();
      if (!donorId) throw new Error("Please login to make a donation");

      const formDataToSend = new FormData();

      // Append files
      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      // Prepare payload with description at root level
      const payload = {
        ...formData,
        donorId,
        donationType: "material",
      };

      // Stringify and append the payload
      formDataToSend.append("data", JSON.stringify(payload));

      // Append location coordinates separately
      formDataToSend.append("longitude", formData.location.coordinates[0]);
      formDataToSend.append("latitude", formData.location.coordinates[1]);

      console.log("Full payload being sent:", payload);

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
        throw new Error(errorData.message || "Failed to submit donation");
      }

      const data = await response.json();
      console.log("Donation created:", data);
      alert("Donation submitted successfully!");

      // Reset form
      setFormData({
        description: "",
        materialDetails: {
          category: "",
          subCategory: "",
          quantity: 1,
          unit: "pieces",
          condition: "new",
          expirationDate: "",
        },
        address: "",
        title: "",
        location: {
          type: "Point",
          coordinates: [38.7636, 8.9806],
        },
      });
      setFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(error.message || "Error submitting donation. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h1>

      <DonationTypeSelector
        donationType={donationType}
        handleDonationTypeChange={handleDonationTypeChange}
      />

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
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            {donationType === "money"
              ? "Money donation form coming soon"
              : "Service donation form coming soon"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DonationForm;

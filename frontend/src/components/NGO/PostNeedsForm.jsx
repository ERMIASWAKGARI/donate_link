import { useState } from "react";
import { FaTimes, FaPlus, FaUpload } from "react-icons/fa";
const NgoNeedForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    needTypes: [],
    urgencyLevel: "Low",
    description: "",
    endDate: "",
    targetMoney: "",
    beneficiaryInfo: {
      numberOfBeneficiaries: "",
      pictures: [],
      location: { latitude: "", longitude: "", address: "" },
    },
    categories: { material: [], service: [] },
  });

  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNeedTypeChange = (type) => {
    setFormData((prev) => {
      const updatedTypes = prev.needTypes.includes(type)
        ? prev.needTypes.filter((t) => t !== type)
        : [...prev.needTypes, type];

      return {
        ...prev,
        needTypes: updatedTypes,
        categories: {
          material: updatedTypes.includes("material")
            ? prev.categories.material
            : [],
          service: updatedTypes.includes("service")
            ? prev.categories.service
            : [],
        },
        targetMoney: updatedTypes.includes("money") ? prev.targetMoney : "",
      };
    });
  };

  const addCategory = (type) => {
    setFormData((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: [
          ...prev.categories[type],
          {
            categoryName: "",
            subCategoryName: "",
            ...(type === "material"
              ? { targetAmountNeeded: "" }
              : { vacancy: "" }),
          },
        ],
      },
    }));
  };

  const handleCategoryChange = (type, index, field, value) => {
    setFormData((prev) => {
      const updatedCategories = [...prev.categories[type]];
      updatedCategories[index][field] = value;
      return {
        ...prev,
        categories: { ...prev.categories, [type]: updatedCategories },
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.beneficiaryInfo.pictures.length > 10) {
      alert("Cannot upload more than 10 pictures.");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);

    setFormData((prev) => ({
      ...prev,
      beneficiaryInfo: {
        ...prev.beneficiaryInfo,
        pictures: [...prev.beneficiaryInfo.pictures, ...files],
      },
    }));
  };

  const removeImage = (index) => {
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);

    const newPictures = [...formData.beneficiaryInfo.pictures];
    newPictures.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      beneficiaryInfo: {
        ...prev.beneficiaryInfo,
        pictures: newPictures,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto my-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a New Need</h2>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Basic Information
          </h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Need Types* (Select 1-3)
            </label>
            <div className="flex flex-wrap gap-3">
              {["money", "material", "service"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleNeedTypeChange(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    formData.needTypes.includes(type)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Urgency Level*</label>
            <select
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date*</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Conditional Money Field */}
          {formData.needTypes.includes("money") && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Target Money*</label>
              <input
                type="number"
                name="targetMoney"
                value={formData.targetMoney}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                step="0.01"
                required
              />
            </div>
          )}
        </div>

        {/* Beneficiary Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Beneficiary Information
          </h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Number of Beneficiaries*
            </label>
            <input
              type="number"
              name="numberOfBeneficiaries"
              value={formData.beneficiaryInfo.numberOfBeneficiaries}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  beneficiaryInfo: {
                    ...prev.beneficiaryInfo,
                    numberOfBeneficiaries: e.target.value,
                  },
                }))
              }
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Location*</label>
            <input
              type="text"
              name="location.address"
              placeholder="Address"
              value={formData.beneficiaryInfo.location.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  beneficiaryInfo: {
                    ...prev.beneficiaryInfo,
                    location: {
                      ...prev.beneficiaryInfo.location,
                      address: e.target.value,
                    },
                  },
                }))
              }
              className="w-full p-2 border border-gray-300 rounded mb-2"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="location.latitude"
                  value={formData.beneficiaryInfo.location.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiaryInfo: {
                        ...prev.beneficiaryInfo,
                        location: {
                          ...prev.beneficiaryInfo.location,
                          latitude: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  min="-90"
                  max="90"
                  step="0.000001"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="location.longitude"
                  value={formData.beneficiaryInfo.location.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiaryInfo: {
                        ...prev.beneficiaryInfo,
                        location: {
                          ...prev.beneficiaryInfo.location,
                          longitude: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  min="-180"
                  max="180"
                  step="0.000001"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Beneficiary Photos (Max 10)
            </label>
            <div className="border border-dashed border-gray-300 rounded p-4">
              <div className="flex flex-wrap gap-4 mb-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="h-24 w-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <label className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300">
                <FaUpload className="mr-2" />
                Upload Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={previewImages.length >= 10}
                />
              </label>
              <span className="text-sm text-gray-500 ml-2">
                {previewImages.length}/10 photos uploaded
              </span>
            </div>
          </div>
        </div>

        {/* Conditional Category Sections */}
        {formData.needTypes.includes("material") && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Material Needs
            </h3>
            {formData.categories.material.map((category, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      value={category.categoryName}
                      onChange={(e) =>
                        handleCategoryChange(
                          "material",
                          index,
                          "categoryName",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      maxLength="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Sub-Category*
                    </label>
                    <input
                      type="text"
                      value={category.subCategoryName}
                      onChange={(e) =>
                        handleCategoryChange(
                          "material",
                          index,
                          "subCategoryName",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      maxLength="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Target Amount*
                    </label>
                    <input
                      type="text"
                      value={category.targetAmountNeeded}
                      onChange={(e) =>
                        handleCategoryChange(
                          "material",
                          index,
                          "targetAmountNeeded",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...formData.categories.material];
                    updated.splice(index, 1);
                    setFormData((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        material: updated,
                      },
                    }));
                  }}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove Category
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addCategory("material")}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              <FaPlus className="mr-1" /> Add Material Category
            </button>
          </div>
        )}

        {formData.needTypes.includes("service") && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Service Needs
            </h3>
            {formData.categories.service.map((category, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      value={category.categoryName}
                      onChange={(e) =>
                        handleCategoryChange(
                          "service",
                          index,
                          "categoryName",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      maxLength="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Sub-Category*
                    </label>
                    <input
                      type="text"
                      value={category.subCategoryName}
                      onChange={(e) =>
                        handleCategoryChange(
                          "service",
                          index,
                          "subCategoryName",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      maxLength="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Vacancy*
                    </label>
                    <input
                      type="text"
                      value={category.vacancy}
                      onChange={(e) =>
                        handleCategoryChange(
                          "service",
                          index,
                          "vacancy",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...formData.categories.service];
                    updated.splice(index, 1);
                    setFormData((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        service: updated,
                      },
                    }));
                  }}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove Category
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addCategory("service")}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              <FaPlus className="mr-1" /> Add Service Category
            </button>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Post Need
          </button>
        </div>
      </form>
    </div>
  );
};

export default NgoNeedForm;

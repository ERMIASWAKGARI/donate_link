import { useState } from "react";
import { FaCloudUploadAlt, FaImages } from "react-icons/fa";

const ImageUpload = ({ pictures, setPictures }) => {
  const [isDragging, setIsDragging] = useState(false);

  const removeImage = (index) => {
    const newPictures = [...pictures];
    newPictures.splice(index, 1);
    setPictures(newPictures);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Combine existing and new images (limit to 10)
    const combined = [...pictures, ...imageFiles].slice(0, 10);
    setPictures(combined);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        <FaImages className="mr-2 text-teal-600" />
        Upload Impact Photos *
      </label>

      <div className="mt-1">
        <label
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            isDragging
              ? "border-teal-500 bg-teal-50"
              : "border-gray-300 hover:border-teal-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FaCloudUploadAlt
              className={`w-12 h-12 mb-3 ${
                isDragging ? "text-teal-500" : "text-gray-400"
              }`}
            />
            <p className="text-sm text-gray-600">
              {pictures.length > 0 ? (
                <span className="text-teal-600 font-medium">
                  {pictures.length} photo(s) selected
                </span>
              ) : (
                <>
                  <span className="font-medium">
                    {isDragging
                      ? "Drop images here"
                      : "Drag & drop photos here"}
                  </span>
                  <br />
                  or click to browse (max 10 images)
                </>
              )}
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            required={pictures.length === 0}
          />
        </label>

        {/* Selected images preview */}
        {pictures.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              SELECTED PHOTOS ({pictures.length}/10)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pictures.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

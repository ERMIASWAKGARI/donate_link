import { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";

const FileUploader = ({
  files,
  fileInputRef,
  handleFileChange,
  removeFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreviewUrls, setLocalPreviewUrls] = useState([]);

  // Generate preview URLs whenever files change
  useEffect(() => {
    const newPreviewUrls = files.map((file) => {
      console.log("Processing file:", file); // Debugging log
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return file.name; // For non-image files (like PDFs)
    });
    setLocalPreviewUrls(newPreviewUrls);

    console.log("Generated preview URLs:", newPreviewUrls);

    // Clean up object URLs when component unmounts
    return () => {
      newPreviewUrls.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        const validFiles = newFiles.filter(
          (file) => file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (validFiles.length > 0) {
          const remainingSlots = 5 - files.length;
          const filesToAdd = validFiles.slice(0, remainingSlots);
          handleFileChange({ target: { files: filesToAdd } });
        }
      }
    },
    [files.length, handleFileChange]
  );

  const handleClick = useCallback(() => {
    if (files.length === 0) {
      fileInputRef.current.click();
    }
  }, [fileInputRef, files.length]);

  return (
    <div className="space-y-2">
      {/* Combined Drag and Drop Zone & Preview Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors min-h-[130px] ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        } ${localPreviewUrls.length > 0 ? "p-2" : "p-6"}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {localPreviewUrls.length === 0 ? (
          // Empty state - show upload prompt
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">
              {isDragging
                ? "Drop files here to upload"
                : "Drag & drop files here or click to browse"}
            </p>
            <p className="text-xs text-gray-500">
              Max 5 files (5MB each). Supports images and PDFs.
            </p>
          </div>
        ) : (
          // Files preview - displayed inside the drop zone
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group h-full">
                <div className="aspect-square bg-gray-200 rounded-md overflow-hidden border border-gray-300">
                  {file.type.startsWith("image/") ? (
                    <>
                      <img
                        src={localPreviewUrls[index]}
                        alt={`Preview ${file.name}`}
                        className="h-[100px] w-[100px] object-contain"
                      />
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-red-50 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs text-red-600 font-medium mt-1 truncate w-full text-center">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove file"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {file.name}
                </div>
              </div>
            ))}

            {/* Add more files button (if less than 5 files) */}
            {files.length < 5 && (
              <div
                className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >
                <div className="text-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-xs text-gray-500 mt-2">Add more files</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf"
          multiple
        />
      </div>

      {/* File Count Info */}
      <div className="text-sm text-gray-500">
        {files.length} file(s) selected (Max 5)
      </div>
    </div>
  );
};

FileUploader.propTypes = {
  files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  fileInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  handleFileChange: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
};

export default FileUploader;

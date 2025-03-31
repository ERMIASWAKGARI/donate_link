import { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const FileUploader = ({
  files,
  fileInputRef,
  handleFileChange,
  removeFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileReaders = useRef([]);

  // Generate previews whenever files change
  useEffect(() => {
    console.log("Files changed, generating new previews", files);

    // Cancel any ongoing file readings
    fileReaders.current.forEach((reader) => {
      if (reader && reader.readyState === 1) {
        reader.abort();
      }
    });
    fileReaders.current = [];

    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = [];
    files.forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        fileReaders.current.push(reader);

        reader.onload = (e) => {
          console.log("FileReader loaded image:", file.name);
          newPreviews[index] = {
            url: e.target.result,
            name: file.name,
            type: "image",
          };
          // Update state only when all images are loaded
          if (
            newPreviews.length === files.length &&
            !newPreviews.includes(undefined)
          ) {
            setPreviews([...newPreviews]);
          }
        };

        reader.onerror = () => {
          console.error("FileReader error for file:", file.name);
          newPreviews[index] = {
            url: null,
            name: file.name,
            type: "image",
            error: true,
          };
          if (
            newPreviews.length === files.length &&
            !newPreviews.includes(undefined)
          ) {
            setPreviews([...newPreviews]);
          }
        };

        console.log("Reading file:", file.name);
        reader.readAsDataURL(file);
      } else {
        newPreviews[index] = {
          url: null,
          name: file.name,
          type: "file",
        };
        if (
          newPreviews.length === files.length &&
          !newPreviews.includes(undefined)
        ) {
          setPreviews([...newPreviews]);
        }
      }
    });

    return () => {
      // Clean up any active file readers
      fileReaders.current.forEach((reader) => {
        if (reader && reader.readyState === 1) {
          reader.abort();
        }
      });
      fileReaders.current = [];
    };
  }, [files]);

  const handleDragEnter = useCallback((e) => {
    console.log("Drag enter");
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    console.log("Drag leave");
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
      console.log("Files dropped");
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        console.log("Dropped files:", newFiles);
        const validFiles = newFiles.filter(
          (file) => file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (validFiles.length > 0) {
          const remainingSlots = 5 - files.length;
          const filesToAdd = validFiles.slice(0, remainingSlots);
          console.log("Adding files:", filesToAdd);
          handleFileChange({ target: { files: filesToAdd } });
        }
      }
    },
    [files.length, handleFileChange]
  );

  const handleClick = useCallback(() => {
    console.log("Upload area clicked");
    if (files.length === 0) {
      console.log("Triggering file input click");
      fileInputRef.current.click();
    }
  }, [fileInputRef, files.length]);

  // ... (keep all the existing drag/drop handlers the same) ...

  return (
    <div className="space-y-4">
      {/* Combined Drag and Drop Zone & Preview Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors min-h-[130px] ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        } ${previews.length > 0 ? "p-2" : "p-6"}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previews.length === 0 ? (
          // Empty state - show upload prompt
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            {/* ... (keep the existing upload prompt SVG and text) ... */}
          </div>
        ) : (
          // Files preview - displayed inside the drop zone
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {previews.map((preview, index) => {
              console.log("Rendering preview:", preview);
              return (
                <div key={index} className="relative group h-full">
                  <div className="aspect-square bg-gray-200 rounded-md overflow-hidden border border-gray-300">
                    {preview.type === "image" ? (
                      preview.url ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${preview.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-100">
                          <span className="text-xs text-gray-600">
                            {preview.error ? "Error loading" : "Loading..."}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-red-50 p-2">
                        {/* ... (keep the existing non-image preview SVG) ... */}
                        <span className="text-xs text-red-600 font-medium mt-1 truncate w-full text-center">
                          {preview.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
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
                    {/* ... (keep the existing remove button SVG) ... */}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {preview.name}
                  </div>
                </div>
              );
            })}

            {/* Add more files button */}
            {previews.length < 5 && (
              <div
                className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >
                {/* ... (keep the existing add more files button) ... */}
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

      <div className="text-sm text-gray-500">
        {previews.length} file(s) selected (Max 5)
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

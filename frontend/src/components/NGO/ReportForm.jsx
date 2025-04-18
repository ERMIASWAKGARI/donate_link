import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ReportForm = ({ selectedNeeds, onGenerate, clearSelection }) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReport = {
      id: Math.floor(Math.random() * 10000),
      needs: selectedNeeds,
      description,
      images,
      date: new Date().toISOString().split("T")[0],
    };

    onGenerate(newReport);
    setDescription("");
    setImages([]);
    setShowPreview(false);
    clearSelection();
  };

  const canPreview = description.trim() !== "" && images.length > 0;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="p-4 border border-gray-300 rounded-lg mt-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800">
          Fill Report for:{" "}
          <span className="text-[#008080]">{selectedNeeds?.title}</span>
        </h3>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write a brief description of the situation..."
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!canPreview}
            className={`flex-1 p-3 rounded-lg font-semibold border ${
              canPreview
                ? "border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            } transition`}
          >
            Preview
          </button>

          <button
            type="submit"
            className="flex-1 p-3 border border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white rounded-lg font-semibold transition"
          >
            Generate Report
          </button>
        </div>
      </form>

      {/* Preview Popup */}
      <AnimatePresence>
        {showPreview && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-lg p-6 bg-white rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.8, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.8, y: "-50%", x: "-50%" }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-bold text-gray-800 mb-4">
                📄 Report Preview
              </h4>
              <p className="text-gray-800 mb-2">
                <strong>Need(s):</strong>{" "}
                <span className="text-[#008080]">{selectedNeeds.title}</span>
              </p>
              <p className="text-gray-800 mb-2">
                <strong>Description:</strong> {description}
              </p>
              <div>
                <strong>Images:</strong>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {images.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportForm;

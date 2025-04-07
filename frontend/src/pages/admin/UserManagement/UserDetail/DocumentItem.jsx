/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FiRotateCw, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlinePhotograph } from 'react-icons/hi';

const statusColors = {
  verified: 'text-green-600 bg-green-100',
  pending: 'text-yellow-600 bg-yellow-100',
  rejected: 'text-red-600 bg-red-100',
};

const DocumentItem = ({
  docType,
  docUrl,
  getDocumentName,
  status = 'pending',
}) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const docName = getDocumentName(docType);
  const fileUrl = `http://localhost:5000/uploads/${docUrl}`;
  const ext = docUrl.split('.').pop().toLowerCase();
  const isPDF = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const handleZoom = (direction) => {
    setZoom((prev) =>
      Math.max(0.5, Math.min(3, direction === 'in' ? prev + 0.25 : prev - 0.25))
    );
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const closeImageViewer = () => {
    setZoom(1);
    setRotation(0);
    setShowImageViewer(false);
  };

  return (
    <>
      <div
        className="border rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition duration-300 hover:border-indigo-400 group cursor-pointer"
        onClick={() => (isImage ? setShowImageViewer(true) : openInNewTab())}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPDF ? (
              <HiOutlineDocumentText className="w-6 h-6 text-indigo-500" />
            ) : (
              <HiOutlinePhotograph className="w-6 h-6 text-pink-500" />
            )}
            <div>
              <p className="text-base font-medium text-gray-800 group-hover:text-indigo-600">
                {docName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
                {ext} file
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              statusColors[status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && isImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black text-white">
            <span className="font-semibold">{docName}</span>
            <button onClick={closeImageViewer} aria-label="Close">
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img
              src={fileUrl}
              alt={docName}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
              }}
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>

          <div className="p-4 flex justify-center gap-4 bg-black text-white text-sm">
            <button onClick={() => handleZoom('out')}>
              <FiZoomOut size={18} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom('in')}>
              <FiZoomIn size={18} />
            </button>
            <button onClick={handleRotate}>
              <FiRotateCw size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentItem;

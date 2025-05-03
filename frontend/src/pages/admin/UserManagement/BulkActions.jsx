/* eslint-disable react/prop-types */
import { useState } from 'react';

const BulkActions = ({
  onBulkBan,
  onBulkUnban,
  selectedCount,
  isProcessing,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null); // "ban" or "unban"

  const handleConfirm = () => {
    if (actionType === 'ban') onBulkBan();
    if (actionType === 'unban') onBulkUnban();
    setShowConfirmModal(false);
    setActionType(null);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} selected
        </span>
        <button
          onClick={() => {
            setActionType('ban');
            setShowConfirmModal(true);
          }}
          disabled={isProcessing}
          className="flex items-center text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          {isProcessing ? 'Processing...' : 'Ban Selected'}
        </button>
        <button
          onClick={() => {
            setActionType('unban');
            setShowConfirmModal(true);
          }}
          disabled={isProcessing}
          className="flex items-center text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isProcessing ? 'Processing...' : 'Unban Selected'}
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="mb-6 text-sm text-gray-700">
              Are you sure you want to{' '}
              <span className="font-bold text-red-600">
                {actionType === 'ban' ? 'ban' : 'unban'}
              </span>
              {' these '}
              {selectedCount} user{selectedCount > 1 ? 's' : ''}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setActionType(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{
                  backgroundColor: actionType === 'ban' ? '#ef4444' : '#008080',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;

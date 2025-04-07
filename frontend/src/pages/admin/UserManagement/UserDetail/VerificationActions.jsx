// VerificationActions.jsx
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const VerificationActions = ({ user, onVerify, onReject }) => {
  const isVerified = user?.isVerified;
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const handleVerifyClick = () => {
    setActionType('verify');
    setShowVerifyModal(true);
  };

  const handleRejectClick = () => {
    setActionType('reject');
    setShowRejectModal(true);
  };

  const handleConfirm = () => {
    if (actionType === 'verify') {
      onVerify();
      setShowVerifyModal(false);
    } else {
      onReject();
      setShowRejectModal(false);
    }
  };

  const handleCancel = () => {
    setShowVerifyModal(false);
    setShowRejectModal(false);
  };

  return (
    <div className="mt-4">
      {isVerified ? (
        <div className="flex items-center gap-2 text-green-600">
          <FiCheckCircle size={20} />
          <span className="text-sm font-medium">User is verified</span>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleVerifyClick}
            className="flex items-center gap-1 text-green-600 hover:text-white hover:bg-green-600 border border-green-600 px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
          >
            <FiCheckCircle size={16} />
            Verify
          </button>
          <button
            onClick={handleRejectClick}
            className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
          >
            <FiXCircle size={16} />
            Reject
          </button>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-gray-200 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Verification</h3>
            <p className="mb-6">Are you sure you want to verify this user?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-gray-200 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Rejection</h3>
            <p className="mb-6">Are you sure you want to reject this user?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-500 rounded-md text-sm font-medium text-white hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationActions;

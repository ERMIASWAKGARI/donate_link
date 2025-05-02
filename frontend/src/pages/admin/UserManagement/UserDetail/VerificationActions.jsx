/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import RejectionModal from './RejectionModal';

const VerificationActions = ({ user, onVerify, onReject }) => {
  const isVerified = user?.isVerified;
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  const handleVerifyClick = () => {
    setShowVerifyModal(true);
  };

  const handleRejectClick = () => {
    setRejectionModalOpen(true);
  };

  const handleConfirmVerify = () => {
    onVerify();
    setShowVerifyModal(false);
  };

  const handleConfirmRejection = async (reason) => {
    const confirmed = window.confirm(
      'Are you sure you want to reject this verification? All uploaded documents will be permanently deleted.'
    );

    if (confirmed) {
      await onReject(reason);
      setRejectionModalOpen(false);
    }
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
            className="flex items-center gap-1 text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Verification</h3>
            <p className="mb-6">Are you sure you want to verify this user?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerify}
                className="flex items-center gap-1 text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with reason input */}
      <RejectionModal
        open={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={handleConfirmRejection}
      />
    </div>
  );
};

export default VerificationActions;

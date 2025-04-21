/* eslint-disable react/prop-types */

const ReactivateModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Reactivate Account
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Your account is currently deactivated. Would you like to reactivate it
          now?
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            onClick={onConfirm}
          >
            Reactivate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivateModal;

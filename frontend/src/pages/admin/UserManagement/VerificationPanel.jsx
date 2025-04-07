/* eslint-disable react/prop-types */

const VerificationPanel = ({
  onVerify,
  onReject,
  rejectionReason,
  setRejectionReason,
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
      <h3 className="font-medium text-yellow-800 mb-3">Verification Actions</h3>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
        <button
          onClick={onVerify}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Verify User
        </button>
        <div className="flex-grow">
          <label
            htmlFor="rejectionReason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rejection Reason
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter reason for rejection"
            />
            <button
              onClick={onReject}
              disabled={!rejectionReason}
              className={`px-4 py-2 rounded ${
                rejectionReason
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Reject Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;

/* eslint-disable react/prop-types */
// VerificationActions.jsx

import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
const VerificationActions = ({ onVerify, onReject }) => (
  <div className="flex space-x-4 mt-6">
    <button
      onClick={onVerify}
      className="flex items-center gap-1 text-green-600 hover:text-white hover:bg-green-600 border border-green-600 px-2 py-1 rounded text-sm transition"
    >
      <FiCheckCircle /> Verify
    </button>
    <button
      onClick={onReject}
      className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded text-sm transition"
    >
      <FiXCircle /> Reject
    </button>
  </div>
);

export default VerificationActions;

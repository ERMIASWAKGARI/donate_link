/* eslint-disable react/prop-types */
// components/common/ErrorDisplay.jsx
const ErrorDisplay = ({ message = 'Failed to load data', className = '' }) => {
  return (
    <div className={`p-4 rounded-md bg-red-50 ${className}`}>
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-red-600 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default ErrorDisplay;

/* eslint-disable react/prop-types */
const BulkActions = ({
  onBulkBan,
  onBulkUnban,
  selectedCount,
  isProcessing,
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">
        {selectedCount} selected
      </span>
      <button
        onClick={onBulkBan}
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
        onClick={onBulkUnban}
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
  );
};

export default BulkActions;

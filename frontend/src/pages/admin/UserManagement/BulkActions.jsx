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
        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Ban Selected'}
      </button>
      <button
        onClick={onBulkUnban}
        disabled={isProcessing}
        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Unban Selected'}
      </button>
    </div>
  );
};

export default BulkActions;

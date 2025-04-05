// eslint-disable-next-line react/prop-types
const BulkActions = ({ onBulkBan, onBulkUnban, selectedCount }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
      <p className="text-blue-800">
        {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
      </p>
      <div className="flex space-x-2">
        <button
          onClick={onBulkBan}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Ban Selected
        </button>
        <button
          onClick={onBulkUnban}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Unban Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActions;

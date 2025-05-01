/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/ActiveFilters.js
import { CloseOutlined } from '@ant-design/icons';

const ActiveFilters = ({
  searchQuery,
  selectedType,
  selectedSort,
  statusFilter,
  handleSearch,
  changeType,
  changeSort,
  handleStatusChange,
  resetAllFilters,
}) => {
  const hasFilters =
    searchQuery || selectedType || selectedSort || statusFilter;

  if (!hasFilters) return null;

  return (
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500">Active Filters:</span>

      {searchQuery && (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-gray-800">
          Search: {searchQuery}
          <button
            onClick={() => handleSearch('')}
            className="ml-1.5 inline-flex text-red-400 hover:text-red-700"
          >
            &times;
          </button>
        </span>
      )}

      {selectedType && (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-gray-800">
          Type: {selectedType === 'donation' ? 'Donation' : 'Need'}
          <button
            onClick={() => changeType('')}
            className="ml-1.5 inline-flex text-red-400 hover:text-red-700"
          >
            &times;
          </button>
        </span>
      )}

      {selectedSort && (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-gray-800">
          Sort:{' '}
          {selectedSort === '-createdAt'
            ? 'Newest First'
            : selectedSort === 'createdAt'
            ? 'Oldest First'
            : selectedSort === '-updatedAt'
            ? 'Recently Updated'
            : 'Least Recently Updated'}
          <button
            onClick={() => changeSort('')}
            className="ml-1.5 inline-flex text-red-400 hover:text-red-700"
          >
            &times;
          </button>
        </span>
      )}

      {statusFilter && (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-gray-800">
          Status:{' '}
          {statusFilter === 'active'
            ? 'Active'
            : statusFilter === 'pending'
            ? 'Pending'
            : statusFilter === 'completed'
            ? 'Completed'
            : 'Rejected'}
          <button
            onClick={() => handleStatusChange('')}
            className="ml-1.5 inline-flex text-red-400 hover:text-red-700"
          >
            &times;
          </button>
        </span>
      )}

      <button
        onClick={resetAllFilters}
        className="ml-auto text-sm font-medium text-red-600 hover:text-red-800 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Reset All
      </button>
    </div>
  );
};

export default ActiveFilters;

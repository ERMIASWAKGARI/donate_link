/* eslint-disable react/prop-types */
import SearchBar from '../common/SearchBar';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'individual_donor', label: 'Individual Donors' },
  { value: 'organization_donor', label: 'Organization Donors' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'admin', label: 'Admins' },
];

const sortOptions = [
  { value: '', label: 'Default Sorting' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'email_asc', label: 'Email (A-Z)' },
  { value: 'email_desc', label: 'Email (Z-A)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const UserFilters = ({
  searchQuery,
  selectedRole,
  selectedSort,
  handleSearch,
  changeRole,
  changeSort,
}) => (
  <div className="px-6 py-4 border-b border-gray-100">
    <div className="flex flex-col md:flex-row gap-4">
      {/* Role Filter */}
      <div className="relative flex-1 md:max-w-xs">
        <label
          htmlFor="role-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Role
        </label>
        <select
          id="role-filter"
          value={selectedRole}
          onChange={(e) => changeRole(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="relative flex-1 md:max-w-xs">
        <label
          htmlFor="sort-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Sort By
        </label>
        <select
          id="sort-filter"
          value={selectedSort}
          onChange={(e) => changeSort(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div className="flex-1">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Search Users
        </label>
        <SearchBar onSearch={handleSearch} value={searchQuery} />
      </div>
    </div>
  </div>
);

export const ActiveFilters = ({
  searchQuery,
  selectedRole,
  selectedSort,
  verifiedFilter,
  bannedFilter,
  activeFilter,
  handleSearch,
  changeRole,
  changeSort,
  handleVerifiedChange,
  handleBannedChange,
  handleActiveChange,
  resetAllFilters,
}) => (
  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
    <span className="text-sm font-medium text-gray-500">Active Filters:</span>

    {searchQuery && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
        Search: {searchQuery}
        <button
          onClick={() => handleSearch('')}
          className="ml-1.5 inline-flex text-indigo-600 hover:text-indigo-900"
        >
          &times;
        </button>
      </span>
    )}

    {selectedRole && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        Role: {roleOptions.find((r) => r.value === selectedRole)?.label}
        <button
          onClick={() => changeRole('')}
          className="ml-1.5 inline-flex text-blue-600 hover:text-blue-900"
        >
          &times;
        </button>
      </span>
    )}

    {selectedSort && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
        Sort: {sortOptions.find((s) => s.value === selectedSort)?.label}
        <button
          onClick={() => changeSort('')}
          className="ml-1.5 inline-flex text-purple-600 hover:text-purple-900"
        >
          &times;
        </button>
      </span>
    )}

    {verifiedFilter && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Verification:{' '}
        {verifiedFilter === 'verified' ? 'Verified' : 'Unverified'}
        <button
          onClick={() => handleVerifiedChange('')}
          className="ml-1.5 inline-flex text-yellow-600 hover:text-yellow-900"
        >
          &times;
        </button>
      </span>
    )}

    {bannedFilter && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Banned: {bannedFilter === 'banned' ? 'Banned' : 'Not Banned'}
        <button
          onClick={() => handleBannedChange('')}
          className="ml-1.5 inline-flex text-red-600 hover:text-red-900"
        >
          &times;
        </button>
      </span>
    )}

    {activeFilter && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Active: {activeFilter === 'active' ? 'Active' : 'Inactive'}
        <button
          onClick={() => handleActiveChange('')}
          className="ml-1.5 inline-flex text-green-600 hover:text-green-900"
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

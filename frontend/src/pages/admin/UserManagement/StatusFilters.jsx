/* eslint-disable react/prop-types */
const StatusFilters = ({
  verifiedFilter,
  bannedFilter,
  activeFilter,
  handleVerifiedChange,
  handleBannedChange,
  handleActiveChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      {/* Verified Filter */}
      <div className="relative flex-1 md:max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Status
        </label>
        <select
          value={verifiedFilter}
          onChange={(e) => handleVerifiedChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Banned Filter */}
      <div className="relative flex-1 md:max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ban Status
        </label>
        <select
          value={bannedFilter}
          onChange={(e) => handleBannedChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">All</option>
          <option value="banned">Banned</option>
          <option value="not_banned">Not Banned</option>
        </select>
      </div>

      {/* Active Filter */}
      <div className="relative flex-1 md:max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Active Status
        </label>
        <select
          value={activeFilter}
          onChange={(e) => handleActiveChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default StatusFilters;

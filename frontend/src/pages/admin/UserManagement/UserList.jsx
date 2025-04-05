/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import DataTable from '../common/DataTable';
import ErrorDisplay from '../common/ErrorDisplay';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import Spinner from '../common/Spinner ';
import StatusBadge from '../common/StatusBadge';
import useUsers from '../hooks/useUsers';
import BulkActions from './BulkActions';

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

const UserList = () => {
  const navigate = useNavigate(); // Add this line

  const [selectedUsers, setSelectedUsers] = useState([]);
  const {
    users,
    loading,
    error,
    pagination,
    searchQuery,
    selectedRole,
    selectedSort,
    handleSearch,
    resetAllFilters,
    changeRole,
    changeSort,
    changePage,
  } = useUsers();

  const columns = [
    {
      Header: 'ID',
      accessor: '_id',
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600">
          {value ? value.slice(0, 6) + '...' : 'N/A'}
        </span>
      ),
    },
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ value }) => value || 'N/A',
    },
    {
      Header: 'Email',
      accessor: 'email',
      Cell: ({ value }) => value || 'N/A',
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => {
        const user = row.original || {};
        return (
          <StatusBadge
            isBanned={user.isBanned || false}
            isVerified={user.isVerified || false}
          />
        );
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => {
        const user = row || {};
        const userId = user._id; // Get the ID first

        if (!userId) {
          console.error('Missing user ID for row:', row);
          return <span className="text-gray-400">N/A</span>;
        }

        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(userId)}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center"
              disabled={!userId}
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View
            </button>

            {user.isBanned ? (
              <button
                onClick={() => handleUnban(userId)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                disabled={!userId}
              >
                Unban
              </button>
            ) : (
              <button
                onClick={() => handleBan(userId)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                disabled={!userId}
              >
                Ban
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // const handleSearch = (query) => {
  //   handleSearch(query);
  // };

  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
  };

  const handleSelectUser = (userId) => {
    if (!userId) return;
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkBan = () => {
    if (selectedUsers.length === 0) return;
    // Implement bulk ban
    console.log('Banning users:', selectedUsers);
  };

  const handleBulkUnban = () => {
    if (selectedUsers.length === 0) return;
    // Implement bulk unban
    console.log('Unbanning users:', selectedUsers);
  };

  const handleView = (userId) => {
    console.log('Viewing user:', userId);
    navigate(`/admin/users/${userId}`); // Navigate to user detail page
  };

  const handleBan = (userId) => {
    if (!userId) return;
    console.log('Banning user:', userId);
    // Implement ban logic
  };

  const handleUnban = (userId) => {
    if (!userId) return;
    console.log('Unbanning user:', userId);
    // Implement unban logic
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-white">
            User Management Dashboard
          </h2>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
            {pagination && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-white/80">
                  Total Users
                </span>
                <p className="text-xl font-bold text-white">
                  {pagination.totalItems?.toLocaleString() || 0}
                </p>
              </div>
            )}
            {selectedRole && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-white/80">
                  Filtered
                </span>
                <p className="text-xl font-bold text-white flex items-center gap-2">
                  {loading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      <span>
                        {users.length}{' '}
                        {
                          roleOptions.find((r) => r.value === selectedRole)
                            ?.label
                        }
                      </span>
                    </>
                  ) : (
                    `${users.length} ${
                      roleOptions.find((r) => r.value === selectedRole)?.label
                    }`
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Controls Section */}
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
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {(selectedRole || selectedSort || searchQuery) && (
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Active Filters:
          </span>

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
      )}
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
          <BulkActions
            onBulkBan={handleBulkBan}
            onBulkUnban={handleBulkUnban}
            selectedCount={selectedUsers.length}
          />
        </div>
      )}
      {/* Data Table */}
      <div className="px-6 py-4">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={users || []}
            onSelect={handleSelectUser}
            selectedItems={selectedUsers}
          />
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" color="indigo" />
        </div>
      )}
      {error && (
        <div className="p-6">
          <ErrorDisplay message={error.message || 'Failed to load users'} />
        </div>
      )}
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default UserList;

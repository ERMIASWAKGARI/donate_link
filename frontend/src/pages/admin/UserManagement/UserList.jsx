/* eslint-disable react/prop-types */
import { useState } from 'react';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import StatusBadge from '../common/StatusBadge';
import useUsers from '../hooks/useUsers';
import BulkActions from './BulkActions';

const UserList = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { users, loading, error, pagination, searchUsers, changePage } =
    useUsers();

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
        const user = row.original || {};
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(user._id)}
              className="text-indigo-600 hover:text-indigo-900"
              disabled={!user._id}
            >
              View
            </button>
            {!user.isBanned ? (
              <button
                onClick={() => handleBan(user._id)}
                className="text-red-600 hover:text-red-900"
                disabled={!user._id}
              >
                Ban
              </button>
            ) : (
              <button
                onClick={() => handleUnban(user._id)}
                className="text-green-600 hover:text-green-900"
                disabled={!user._id}
              >
                Unban
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleSearch = (query) => {
    searchUsers(query);
  };

  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo(0, 0); // Optional: scroll to top on page change
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
    if (!userId) return;
    console.log('Viewing user:', userId);
    // Implement view logic
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

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error)
    return (
      <div className="p-6 text-red-500">
        Error: {error.message || 'Failed to load users'}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        {pagination && (
          <p className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Total Users: {pagination.totalItems || 0}
            {pagination.totalItems > 0 && (
              <span className="ml-2">
                (Showing {users.length} on this page)
              </span>
            )}
          </p>
        )}
        <SearchBar onSearch={handleSearch} />
      </div>

      {selectedUsers.length > 0 && (
        <BulkActions
          onBulkBan={handleBulkBan}
          onBulkUnban={handleBulkUnban}
          selectedCount={selectedUsers.length}
        />
      )}

      <DataTable
        columns={columns}
        data={users || []}
        onSelect={handleSelectUser}
        selectedItems={selectedUsers}
      />

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default UserList;

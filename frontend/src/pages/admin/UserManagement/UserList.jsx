import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import useUsers from '../hooks/useUsers';
import BulkActions from './BulkActions';
import { ActiveFilters, UserFilters } from './UserFilters';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';

const UserList = () => {
  const navigate = useNavigate();
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

  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo(0, 0);
  };

  const handleSelectUser = (userId) => {
    if (!userId) return;
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleView = (userId) => navigate(`/admin/users/${userId}`);
  const handleBan = (userId) => console.log('Banning user:', userId);
  const handleUnban = (userId) => console.log('Unbanning user:', userId);
  const handleBulkBan = () => console.log('Banning users:', selectedUsers);
  const handleBulkUnban = () => console.log('Unbanning users:', selectedUsers);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-white">
            User Management Dashboard
          </h2>
          <UserStats
            pagination={pagination}
            users={users}
            loading={loading}
            selectedRole={selectedRole}
          />
        </div>
      </div>

      {/* Filters Section */}
      <UserFilters
        searchQuery={searchQuery}
        selectedRole={selectedRole}
        selectedSort={selectedSort}
        handleSearch={handleSearch}
        changeRole={changeRole}
        changeSort={changeSort}
      />

      {/* Active Filters */}
      {(selectedRole || selectedSort || searchQuery) && (
        <ActiveFilters
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          selectedSort={selectedSort}
          handleSearch={handleSearch}
          changeRole={changeRole}
          changeSort={changeSort}
          resetAllFilters={resetAllFilters}
        />
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

      {/* Main Table */}
      <UserTable
        users={users}
        loading={loading}
        error={error}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onView={handleView}
        onBan={handleBan}
        onUnban={handleUnban}
      />

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

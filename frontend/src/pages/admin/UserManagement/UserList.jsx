import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import useUsers from '../hooks/useUsers';
import BulkActions from './BulkActions';
import StatusFilters from './StatusFilters';
import { ActiveFilters, UserFilters } from './UserFilters';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';

const UserList = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    users,
    loading,
    error,
    pagination,
    searchQuery,
    selectedRole,
    selectedSort,
    handleSearch,
    verifiedFilter,
    bannedFilter,
    activeFilter,
    handleVerifiedChange,
    handleBannedChange,
    handleActiveChange,
    resetAllFilters,
    changeRole,
    changeSort,
    changePage,
    banSingleUser,
    unbanSingleUser,
    banMultipleUsers,
    unbanMultipleUsers,
    // eslint-disable-next-line no-unused-vars
    refetch,
  } = useUsers();

  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo(0, 0);
  };

  const handleView = (userId) => navigate(`/admin/users/${userId}`);

  const handleBan = async (userId) => {
    setIsProcessing(true);
    const success = await banSingleUser(userId);
    if (success) {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
    setIsProcessing(false);
  };

  const handleUnban = async (userId) => {
    setIsProcessing(true);
    const success = await unbanSingleUser(userId);
    if (success) {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
    setIsProcessing(false);
  };

  const handleBulkBan = async () => {
    if (selectedUsers.length === 0) return;

    setIsProcessing(true);
    const success = await banMultipleUsers(selectedUsers);
    if (success) {
      setSelectedUsers([]);
    }
    setIsProcessing(false);
  };

  const handleBulkUnban = async () => {
    if (selectedUsers.length === 0) return;

    setIsProcessing(true);
    const success = await unbanMultipleUsers(selectedUsers);
    if (success) {
      setSelectedUsers([]);
    }
    setIsProcessing(false);
  };

  const handleSelectUser = (userId) => {
    if (!userId) return;
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(users.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-[rgb(0,128,128)] px-6 py-4">
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

      <div className="px-6 py-4 border-b border-gray-100">
        <UserFilters
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          selectedSort={selectedSort}
          handleSearch={handleSearch}
          changeRole={changeRole}
          changeSort={changeSort}
        />

        <StatusFilters
          verifiedFilter={verifiedFilter}
          bannedFilter={bannedFilter}
          activeFilter={activeFilter}
          handleVerifiedChange={handleVerifiedChange}
          handleBannedChange={handleBannedChange}
          handleActiveChange={handleActiveChange}
        />
      </div>

      {(selectedRole ||
        selectedSort ||
        searchQuery ||
        verifiedFilter ||
        bannedFilter ||
        activeFilter) && (
        <ActiveFilters
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          selectedSort={selectedSort}
          verifiedFilter={verifiedFilter}
          bannedFilter={bannedFilter}
          activeFilter={activeFilter}
          handleSearch={handleSearch}
          changeRole={changeRole}
          changeSort={changeSort}
          handleVerifiedChange={handleVerifiedChange}
          handleBannedChange={handleBannedChange}
          handleActiveChange={handleActiveChange}
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
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Main Table */}
      <UserTable
        users={users}
        loading={loading || isProcessing}
        error={error}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onBan={handleBan}
        onUnban={handleUnban}
        isProcessing={isProcessing}
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

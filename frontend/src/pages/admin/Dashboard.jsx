import { Spin } from 'antd';
import AdminLayout from './AdminLayout/index';
import ErrorDisplay from './common/ErrorDisplay';
import useDashboardUsers from './hooks/useDashboardUsers';

const AdminDashboard = () => {
  const { users, pagination, loading, error } = useDashboardUsers();

  // Calculate statistics from users data
  const totalUsers = pagination?.totalItems || 0;
  const verifiedUsers = users?.filter((user) => user.isVerified).length || 0;
  const bannedUsers = users?.filter((user) => user.isBanned).length || 0;
  const pendingVerification =
    users?.filter((user) => !user.isVerified && !user.isBanned).length || 0;

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-semibold">
            {totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Verified Users</h3>
          <p className="text-2xl font-semibold">
            {verifiedUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Banned Users</h3>
          <p className="text-2xl font-semibold">
            {bannedUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">
            Pending Verification
          </h3>
          <p className="text-2xl font-semibold">
            {pendingVerification.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        {/* Activity list would go here */}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      )}
      {error && (
        <div className="p-6">
          <ErrorDisplay message={error.message || 'Failed to load users'} />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

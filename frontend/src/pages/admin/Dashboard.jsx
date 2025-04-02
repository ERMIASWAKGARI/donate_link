import AdminLayout from './AdminLayout/index';
import useUsers from './hooks/useUsers';

const AdminDashboard = () => {
  const { users, pagination, loading, error } = useUsers();

  // Calculate statistics from users data
  const totalUsers = pagination?.totalItems || 0;
  const verifiedUsers = users?.filter((user) => user.isVerified).length || 0;
  const bannedUsers = users?.filter((user) => user.isBanned).length || 0;
  const pendingVerification =
    users?.filter((user) => !user.isVerified && !user.isBanned).length || 0;

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6">Loading dashboard data...</div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">
          Error loading user data: {error.message}
        </div>
      </AdminLayout>
    );

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
    </AdminLayout>
  );
};

export default AdminDashboard;

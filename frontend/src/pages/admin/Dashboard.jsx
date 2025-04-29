import AdminLayout from './AdminLayout/index';
import DashboardTabs from './DashboardTabs';
import useDashboardUsers from './hooks/useDashboardUsers';

const AdminDashboard = () => {
  const { users, pagination, loading, error } = useDashboardUsers(true);

  return (
    <AdminLayout>
      <div>
        <DashboardTabs
          users={users}
          pagination={pagination}
          loading={loading}
          error={error}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

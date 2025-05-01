import AdminLayout from './AdminLayout/index';
import DashboardTabs from './DashboardTabs';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div>
        <DashboardTabs />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

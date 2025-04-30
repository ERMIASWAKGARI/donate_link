/* eslint-disable react/prop-types */
import { Spin, Tabs } from 'antd';
import useDashboardPosts from './hooks/useDashboardPosts';
import ErrorDisplay from './common/ErrorDisplay';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PostAnalytics = () => {
  const { posts, loading, error } = useDashboardPosts(true);

  // Filter posts by type
  const donationPosts =
    posts?.filter((post) => post.postType === 'donation') || [];
  const needsPosts = posts?.filter((post) => post.postType === 'need') || [];

  // Prepare data for donation posts analytics
  const donationStatusData = [
    {
      name: 'Pending',
      value: donationPosts.filter((p) => p.status === 'pending').length,
    },
    {
      name: 'Requested',
      value: donationPosts.filter((p) => p.status === 'requested').length,
    },
    {
      name: 'Accepted',
      value: donationPosts.filter((p) => p.status === 'accepted').length,
    },
    {
      name: 'Rejected',
      value: donationPosts.filter((p) => p.status === 'rejected').length,
    },
    {
      name: 'Completed',
      value: donationPosts.filter((p) => p.status === 'completed').length,
    },
  ];

  // Prepare data for needs posts analytics
  const needsTypeData = [
    {
      name: 'Money',
      value: needsPosts.filter((p) => p.needTypes?.includes('money')).length,
    },
    {
      name: 'Material',
      value: needsPosts.filter((p) => p.needTypes?.includes('material')).length,
    },
    {
      name: 'Services',
      value: needsPosts.filter((p) => p.needTypes?.includes('service')).length,
    },
  ];

  const needsStatusData = [
    {
      name: 'Open',
      value: needsPosts.filter((p) => p.status === 'Open').length,
    },
    {
      name: 'Fulfilled',
      value: needsPosts.filter((p) => p.status === 'Fulfilled').length,
    },
    {
      name: 'Expired',
      value: needsPosts.filter((p) => p.status === 'Expired').length,
    },
    {
      name: 'Closed',
      value: needsPosts.filter((p) => p.status === 'Closed').length,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-semibold">{payload[0].name}</p>
          <p>Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay message={error.message || 'Failed to load posts'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Organization Donations" key="1">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {donationStatusData.map((status) => (
                <div
                  key={status.name}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">{status.name}</h3>
                  <p className="text-3xl font-bold">{status.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Donation Status Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {donationStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Donations Over Time
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={donationPosts
                        .sort(
                          (a, b) =>
                            new Date(a.createdAt) - new Date(b.createdAt)
                        )
                        .map((post) => ({
                          date: new Date(post.createdAt).toLocaleDateString(),
                          count: 1,
                        }))
                        .reduce((acc, curr) => {
                          const existing = acc.find(
                            (item) => item.date === curr.date
                          );
                          if (existing) {
                            existing.count += 1;
                          } else {
                            acc.push(curr);
                          }
                          return acc;
                        }, [])}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" name="Donations" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="NGO Needs" key="2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Total Needs</h3>
                <p className="text-3xl font-bold">{needsPosts.length}</p>
              </div>
              {needsTypeData.map((type) => (
                <div key={type.name} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {type.name} Needs
                  </h3>
                  <p className="text-3xl font-bold">{type.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Needs by Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={needsTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {needsTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Needs Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={needsStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {needsStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default PostAnalytics;

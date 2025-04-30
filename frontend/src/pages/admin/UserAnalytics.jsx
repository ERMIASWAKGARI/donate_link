/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';

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

import ErrorDisplay from './common/ErrorDisplay';
import { Spin } from 'antd';
import useDashboardUsers from './hooks/useDashboardUsers';

const ALL_ROLES = [
  'individual_donor',
  'organization_donor',
  'volunteer',
  'ngo',
  'admin',
];

const VERIFICATION_STATUSES = ['not_verified', 'pending', 'verified'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserAnalytics = () => {
  const { users, loading, error, pagination } = useDashboardUsers(true);

  const totalUsers = pagination?.totalItems || 0;
  const bannedUsers = users?.filter((user) => user.isBanned).length || 0;

  // Prepare data for charts - ensure all roles are represented
  const roleDistribution = ALL_ROLES.reduce((acc, role) => {
    acc[role] = users?.filter((user) => user.role === role).length || 0;
    return acc;
  }, {});

  // Prepare verification status data - ensure all statuses are represented
  const verificationDistribution = VERIFICATION_STATUSES.reduce(
    (acc, status) => {
      acc[status] =
        users?.filter((user) => user.verificationStatus === status).length || 0;
      return acc;
    },
    {}
  );

  const roleData = Object.keys(roleDistribution).map((role) => ({
    name: role.replace('_', ' ').toUpperCase(),
    value: roleDistribution[role],
    percentage:
      totalUsers > 0
        ? ((roleDistribution[role] / totalUsers) * 100).toFixed(1) + '%'
        : '0%',
  }));

  const verificationData = [
    {
      name: 'Not Verified',
      value: verificationDistribution['not_verified'],
      percentage:
        totalUsers > 0
          ? (
              (verificationDistribution['not_verified'] / totalUsers) *
              100
            ).toFixed(1) + '%'
          : '0%',
    },
    {
      name: 'Pending',
      value: verificationDistribution['pending'],
      percentage:
        totalUsers > 0
          ? ((verificationDistribution['pending'] / totalUsers) * 100).toFixed(
              1
            ) + '%'
          : '0%',
    },
    {
      name: 'Verified',
      value: verificationDistribution['verified'],
      percentage:
        totalUsers > 0
          ? ((verificationDistribution['verified'] / totalUsers) * 100).toFixed(
              1
            ) + '%'
          : '0%',
    },
  ];

  const bannedData = [
    { name: 'Active', value: totalUsers - bannedUsers },
    { name: 'Banned', value: bannedUsers },
  ];

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-semibold">{payload[0].name}</p>
          <p>Count: {payload[0].value}</p>
          {payload[0].payload.percentage && (
            <p>Percentage: {payload[0].payload.percentage}</p>
          )}
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
        <ErrorDisplay message={error.message || 'Failed to load users data'} />
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Users',
            value: totalUsers,
            link: '/admin/users',
          },
          {
            title: 'Verified Users',
            value: verificationDistribution['verified'],
          },
          { title: 'Banned Users', value: bannedUsers },
          {
            title: 'Pending Verification',
            value: verificationDistribution['pending'],
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between"
          >
            <h3 className="text-gray-500 text-sm font-medium truncate">
              {card.title}
            </h3>

            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-bold text-gray-800">
                {card.value.toLocaleString()}
              </p>
              {card.link && (
                <Link
                  to={card.link}
                  className="text-sm text-[#008080] hover:underline ml-4"
                >
                  View All
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* User Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            User Roles
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => ` ${percentage}`}
                >
                  {roleData.map((entry, index) => (
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
        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Verification Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => ` ${percentage}`}
                >
                  {verificationData.map((entry, index) => (
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
        {/* Banned Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Account Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bannedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ value }) => ` ${value}`}
                >
                  {bannedData.map((entry, index) => (
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
      {/* Detailed User Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed User Breakdown
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roleData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="User Count" fill="#008080" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default UserAnalytics;

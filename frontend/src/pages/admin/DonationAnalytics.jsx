/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Spin, Table, Tag } from 'antd';
import useDashboardDonations from './hooks/useDashboardDonations';
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

const DonationAnalytics = () => {
  const { donations, loading, error } = useDashboardDonations(true);

  // Calculate total monetary donations by currency
  const monetaryDonationsByCurrency =
    donations
      ?.filter((d) => d.donationType === 'monetary' && d.status === 'completed')
      .reduce((acc, donation) => {
        const currency = donation.currency;
        const existing = acc.find((item) => item.currency === currency);
        if (existing) {
          existing.total += donation.amount;
          existing.count += 1; // assuming you want accurate count
        } else {
          acc.push({
            currency,
            total: donation.amount,
            count: 1,
          });
        }
        return acc;
      }, []) || [];

  const totalCompletedMonetaryDonations = monetaryDonationsByCurrency.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const totalMaterialDonations =
    donations?.filter((d) => d.donationType === 'material').length || 0;

  // Prepare data for charts
  const donationTypeData = [
    {
      name: 'Monetary',
      value:
        donations?.filter(
          (d) => d.donationType === 'monetary' && d.status === 'completed'
        ).length || 0,
    },
    {
      name: 'Material',
      value: totalMaterialDonations,
    },
  ];

  const currencyData = monetaryDonationsByCurrency.map((item) => ({
    name: item.currency,
    value: item.total,
    count: item.count,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p>
            Total Amount: {data.value.toLocaleString()} {data.name}
          </p>
          {data.count && <p>Number of Donations: {data.count}</p>}
        </div>
      );
    }
    return null;
  };

  // Table columns
  const columns = [
    {
      title: 'Donor',
      dataIndex: 'donor',
      key: 'donor',
      render: (donor) => donor?.name || 'Anonymous',
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (recipient) => recipient?.name || 'Unknown',
    },
    {
      title: 'Type',
      dataIndex: 'donationType',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'monetary' ? 'green' : 'blue'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => {
        if (record.donationType === 'monetary') {
          return `${amount?.toLocaleString()} ${record.currency}`;
        }
        return record.materials
          ?.map(
            (material) =>
              `${material.categoryName}, ${material.subCategoryName} (${
                material.quantity
              }${material.unit ? ` ${material.unit}` : ''})`
          )
          .join(', ');
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'completed'
              ? 'green'
              : status === 'pending'
              ? 'orange'
              : 'red'
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

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
        <ErrorDisplay message={error.message || 'Failed to load donations'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Donations Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className=" mb-4 text-gray-500 text-sm font-medium truncate">
            Total Donations
          </h3>
          <p className="text-3xl font-bold text-gray-800 ">
            {donations?.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4 text-gray-500 text-sm font-medium truncate">
            Monetary Donations
          </h3>

          <p className="text-3xl font-bold text-gray-800 mb-2">
            {totalCompletedMonetaryDonations}
          </p>

          <div className="space-y-2">
            {monetaryDonationsByCurrency.map((item) => (
              <div key={item.currency} className="flex justify-between">
                <span>{item.currency}:</span>
                <span className="font-semibold">
                  {item.total.toLocaleString()} {item.currency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4 text-gray-500 text-sm font-medium truncate">
            Material Donations
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            {totalMaterialDonations}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium truncate mb-4">
            Donation Types
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {donationTypeData.map((entry, index) => (
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
          <h3 className="text-gray-500 text-sm font-medium truncate mb-4">
            Monetary Donations by Currency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${value.toLocaleString()}`
                  }
                >
                  {currencyData.map((entry, index) => (
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

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium truncate mb-4">
          All Donations
        </h3>
        <Table
          columns={columns}
          dataSource={donations}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default DonationAnalytics;

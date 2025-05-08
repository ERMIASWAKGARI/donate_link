/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Spin,
  Empty,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Input,
  message,
} from 'antd';
import {
  DollarOutlined,
  GiftOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import { UserContext } from '../../context/UserContext';
import Header from '../../components/header/Header';
import api from '../../config/axiosConfig';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useContext(UserContext);

  // State management
  const [loading, setLoading] = useState({
    payment: false,
    material: false,
    service: false,
  });
  const [activeTab, setActiveTab] = useState('1');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);

  // Material donations state
  const [materialSubTab, setMaterialSubTab] = useState('1');
  const [directDonations, setDirectDonations] = useState([]);
  const [postedDonations, setPostedDonations] = useState([]);

  // Donation completion state
  const [trackingId, setTrackingId] = useState('');
  const [completingDonation, setCompletingDonation] = useState(false);
  const [activeDonation, setActiveDonation] = useState(null);

  // Completion handler
  const completeDonation = async (record) => {
    try {
      setCompletingDonation(true);
      const response = await api.patch(
        `/users/material-complete/${record._id}`
      );

      console.log('reeee: ', response);

      // Update the correct donation list based on active sub-tab

      setPostedDonations(
        postedDonations.map((d) =>
          d._id === response.data.data.donation._id
            ? { ...d, status: 'completed' }
            : d
        )
      );

      setTrackingId('');
      setActiveDonation(null);
      message.success('Donation completed successfully!');
    } catch (error) {
      console.log('eeee', error.message);
      message.error(
        error.response?.data?.message ||
          'Failed to complete donation. Please try again.'
      );
    } finally {
      setCompletingDonation(false);
    }
  };

  // Data fetching functions
  const fetchPaymentHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, payment: true }));
      const response = await api.get(`/users/payment/${user._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPaymentHistory(response.data.data.payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, payment: false }));
    }
  };

  const fetchMaterialHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, material: true }));

      // Fetch both types in parallel
      const [directRes, postedRes] = await Promise.all([
        api.get(`/users/material/${user._id}`),
        api.get(`/users/posted-material/${user._id}`),
      ]);

      setDirectDonations(directRes.data.data.donations);
      setPostedDonations(postedRes.data.data.donations);
    } catch (error) {
      console.error('Error fetching material history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, material: false }));
    }
  };

  const fetchServiceHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, service: true }));
      const response = await api.get(`/users/service/${user._id}`);
      setServiceHistory(response.data.data.services);
    } catch (error) {
      console.error('Error fetching service history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, service: false }));
    }
  };

  // Effect for initial data loading
  useEffect(() => {
    if (user?._id) {
      if (activeTab === '1' && paymentHistory.length === 0) {
        fetchPaymentHistory();
      } else if (
        activeTab === '2' &&
        directDonations.length === 0 &&
        postedDonations.length === 0
      ) {
        fetchMaterialHistory();
      } else if (activeTab === '3' && serviceHistory.length === 0) {
        fetchServiceHistory();
      }
    }
  }, [user?._id, activeTab]);

  // Status tag renderer
  const renderStatusTag = (status) => {
    let color, icon;
    const statusLower = (status || '').toLowerCase();

    switch (statusLower) {
      case 'completed':
      case 'approved':
        color = 'green';
        icon = <CheckCircleOutlined />;
        break;
      case 'pending':
      case 'posted':
      case 'submitted':
        color = 'orange';
        icon = <ClockCircleOutlined />;
        break;
      case 'failed':
      case 'rejected':
        color = 'red';
        icon = <CloseCircleOutlined />;
        break;
      case 'accepted':
        color = 'blue';
        icon = <CheckCircleOutlined />;
        break;
      default:
        color = 'gray';
        icon = <ClockCircleOutlined />;
    }

    return (
      <Tag icon={icon} color={color}>
        {status}
      </Tag>
    );
  };

  // Column definitions
  const postedMaterialColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'NGO',
      dataIndex: ['NGO', 'name'],
      key: 'ngo',
    },
    {
      title: 'Material Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <div>Category: {record.materialDetails?.category}</div>
          <div>Subcategory: {record.materialDetails?.subCategory}</div>
          <div>
            Quantity: {record.materialDetails?.quantity}{' '}
            {record.materialDetails?.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Tracking ID',
      dataIndex: 'trackingId',
      key: 'tracking',
      render: (id) => id || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.status === 'accepted' && (
          <Button
            type="primary"
            loading={completingDonation && activeDonation?._id === record._id}
            onClick={() => {
              setActiveDonation(record);
              completeDonation(record); // pass record if needed
            }}
          >
            Complete Donation
          </Button>
        ),
    },
  ];

  const materialColumns = [
    {
      title: 'NGO',
      dataIndex: ['NGO', 'name'],
      key: 'ngo',
    },
    {
      title: 'For',
      dataIndex: ['needId', 'title'],
      key: 'for',
      render: (title) => title || 'Unknown Need',
    },
    {
      title: 'Materials',
      dataIndex: 'materials',
      key: 'materials',
      render: (materials) => (
        <div>
          {materials?.map((material, idx) => (
            <div key={idx}>
              {material.quantity} {material.unit} of {material.categoryName} (
              {material.subCategoryName})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location?.address || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Tracking ID',
      dataIndex: 'trackingId',
      key: 'tracking',
      render: (id) => id || 'N/A',
    },
  ];

  const paymentColumns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => `${amount} ${record.currency}`,
    },
    {
      title: 'NGO',
      dataIndex: ['NGOId', 'name'],
      key: 'ngo',
    },
    {
      title: 'For',
      dataIndex: ['needId', 'title'],
      key: 'for',
      render: (title) => title || 'Unknown Need',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Transaction Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const serviceColumns = [
    {
      title: 'NGO',
      dataIndex: ['NGO', 'name'],
      key: 'ngo',
    },
    {
      title: 'For',
      dataIndex: ['need', 'title'],
      key: 'for',
      render: (title) => title || 'Unknown Need',
    },
    {
      title: 'Service/Category',
      dataIndex: 'category',
      key: 'service',
      render: (category, record) => `${category} - ${record.subCategory}`,
    },
    {
      title: 'Motivation',
      dataIndex: 'motivation',
      key: 'motivation',
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <div>
          <div>Start: {new Date(record.startDate).toLocaleDateString()}</div>
          {record.endDate && (
            <div>End: {new Date(record.endDate).toLocaleDateString()}</div>
          )}
          {record.hoursPerWeek && <div>Hours/Week: {record.hoursPerWeek}</div>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Material Donations Sub-Tabs Component
  const MaterialDonationsTab = () => (
    <Tabs
      activeKey={materialSubTab}
      onChange={setMaterialSubTab}
      className="bg-white rounded-lg shadow"
      tabBarGutter={32} // adds spacing between tabs (optional)
      moreIcon={null} // hides the overflow icon if not needed
      renderTabBar={(props, DefaultTabBar) => (
        <div className="flex justify-center">
          <DefaultTabBar {...props} />
        </div>
      )}
    >
      <TabPane
        tab={
          <Space size={8}>
            <GiftOutlined />
            <span>Direct Donations</span>
          </Space>
        }
        key="1"
      >
        {loading.material ? (
          <div className="flex justify-center items-center my-8">
            <Spin size="large" />
          </div>
        ) : directDonations.length > 0 ? (
          <Table
            columns={materialColumns}
            dataSource={directDonations}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="No direct material donations found" />
        )}
      </TabPane>
      <TabPane
        tab={
          <Space size={8}>
            <GiftOutlined />
            <span>Posted Donations</span>
          </Space>
        }
        key="2"
      >
        {loading.material ? (
          <div className="flex justify-center items-center my-8">
            <Spin size="large" />
          </div>
        ) : postedDonations.length > 0 ? (
          <Table
            columns={postedMaterialColumns}
            dataSource={postedDonations}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="No posted material donations found" />
        )}
      </TabPane>
    </Tabs>
  );

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-700 font-medium flex items-center mb-6"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <Title level={2} className="text-center mb-8">
          Your Donation History
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="bg-white rounded-lg shadow"
          tabBarGutter={32} // adds spacing between tabs (optional)
          moreIcon={null} // hides the overflow icon if not needed
          renderTabBar={(props, DefaultTabBar) => (
            <div className="flex justify-center">
              <DefaultTabBar {...props} />
            </div>
          )}
        >
          <TabPane
            tab={
              <Space size={8}>
                <DollarOutlined />
                <span>Monetary Donations</span>
              </Space>
            }
            key="1"
          >
            {loading.payment ? (
              <div className="flex justify-center items-center my-8">
                <Spin size="large" />
              </div>
            ) : paymentHistory.length > 0 ? (
              <Table
                columns={paymentColumns}
                dataSource={paymentHistory}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="No monetary donations found" />
            )}
          </TabPane>

          <TabPane
            tab={
              <Space size={8}>
                <GiftOutlined />
                <span>Material Donations</span>
              </Space>
            }
            key="2"
          >
            <MaterialDonationsTab />
          </TabPane>

          <TabPane
            tab={
              <Space size={8}>
                <TeamOutlined />
                <span>Volunteer Services</span>
              </Space>
            }
            key="3"
          >
            {loading.service ? (
              <div className="flex justify-center items-center my-8">
                <Spin size="large" />
              </div>
            ) : serviceHistory.length > 0 ? (
              <Table
                columns={serviceColumns}
                dataSource={serviceHistory}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="No volunteer services found" />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default HistoryPage;

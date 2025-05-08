/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tabs, Spin, Empty, Table, Tag, Typography, Space } from 'antd';
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
  const [loading, setLoading] = useState({
    payment: false,
    material: false,
    service: false,
  });
  const [activeTab, setActiveTab] = useState('1');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [materialHistory, setMaterialHistory] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, payment: true }));
      const paymentRes = await api.get(`/users/payment/${user._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setPaymentHistory(paymentRes.data.data.payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, payment: false }));
    }
  };

  const fetchMaterialHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, material: true }));
      const materialRes = await api.get(`/users/material/${user._id}`);
      setMaterialHistory(materialRes.data.data.donations);
    } catch (error) {
      console.error('Error fetching material history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, material: false }));
    }
  };

  const fetchServiceHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, service: true }));
      const serviceRes = await api.get(`/users/service/${user._id}`);
      setServiceHistory(serviceRes.data.data.services);
    } catch (error) {
      console.error('Error fetching service history:', error);
    } finally {
      setLoading((prev) => ({ ...prev, service: false }));
    }
  };

  useEffect(() => {
    if (user?._id) {
      // Load only payment history initially
      if (activeTab === '1' && paymentHistory.length === 0) {
        fetchPaymentHistory();
      }
    }
  }, [user?._id, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (user?._id) {
      if (key === '1' && paymentHistory.length === 0) {
        fetchPaymentHistory();
      } else if (key === '2' && materialHistory.length === 0) {
        fetchMaterialHistory();
      } else if (key === '3' && serviceHistory.length === 0) {
        fetchServiceHistory();
      }
    }
  };

  const renderStatusTag = (status) => {
    let color, icon;
    switch (status) {
      case 'Completed':
      case 'completed':
      case 'Approved':
      case 'approved':
        color = 'green';
        icon = <CheckCircleOutlined />;
        break;
      case 'Pending':
      case 'pending':
      case 'Submitted':
      case 'submitted':
        color = 'orange';
        icon = <ClockCircleOutlined />;
        break;
      case 'Failed':
      case 'failed':
      case 'rejected':
      case 'Rejected':
        color = 'red';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'blue';
        icon = <ClockCircleOutlined />;
    }
    return (
      <Tag icon={icon} color={color}>
        {status}
      </Tag>
    );
  };

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
    {
      title: 'Receipt',
      dataIndex: 'receiptUrl',
      key: 'receipt',
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          'N/A'
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
          {materials.map((material, idx) => (
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
      render: (location) => `${location.address}`,
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

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-700 font-medium flex items-center"
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
          defaultActiveKey="1"
          centered
          onChange={handleTabChange}
          className="bg-white rounded-lg shadow"
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
                pagination={{ pageSize: 5 }}
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
            {loading.material ? (
              <div className="flex justify-center items-center my-8">
                <Spin size="large" />
              </div>
            ) : materialHistory.length > 0 ? (
              <Table
                columns={materialColumns}
                dataSource={materialHistory}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty description="No material donations found" />
            )}
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
                pagination={{ pageSize: 5 }}
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

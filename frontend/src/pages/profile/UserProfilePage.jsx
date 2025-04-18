import { Col, Row, Spin } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import ProfileBasicInfo from './../../components/profile/ProfileBasicInfo';
import ProfileDetails from './../../components/profile/ProfileDetails';
const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUser(response.data.data[0]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setUser(response.data.data[0]);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // message.error('Failed to refresh profile data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error || 'User data not available'}</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen py-10 px-4 bg-gray-50 flex justify-center">
        <div className="w-full max-w-screen-xl">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <ProfileBasicInfo
                user={user}
                loading={loading}
                setLoading={setLoading}
                onProfileUpdate={handleProfileUpdate}
              />
            </Col>
            <Col xs={24} md={16}>
              <ProfileDetails
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

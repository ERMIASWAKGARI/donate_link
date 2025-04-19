import { Spin } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import ProfileBasicInfo from './../../components/profile/ProfileBasicInfo';
const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false); // Separate state for updates

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setUser(response.data.data[0]);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (updateData) => {
    try {
      setUpdateLoading(true);
      await axios.patch(`${API_BASE_URL}/api/users/me/update`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      await fetchUserProfile();
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update profile');
    } finally {
      setUpdateLoading(false);
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
    <div className="relative min-h-screen">
      {updateLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Spin size="large" />
        </div>
      )}

      <Header />
      <div className="py-12 px-4 bg-gray-100 flex justify-center">
        <div className="w-full max-w-5xl space-y-10">
          <ProfileBasicInfo
            user={user}
            loading={updateLoading}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

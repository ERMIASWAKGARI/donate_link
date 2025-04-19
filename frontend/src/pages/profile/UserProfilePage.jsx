import { Spin } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/ErrorMessage';
import Header from '../../components/header/Header';
import ProfileBasicInfo from './../../components/profile/ProfileBasicInfo';
import { validateProfile } from './../../components/profile/ProfileDataValidator';

const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
      setError({
        message: err.response?.data?.message || 'Failed to fetch profile',
        details: err.response?.data?.details,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (updateData) => {
    // Validate before submitting
    const errors = validateProfile(user, updateData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError({
        message: `${errors.name}`,
        details: 'Some fields contain invalid data',
        status: 400,
      });
      return;
    }

    try {
      setUpdateLoading(true);
      setError(null);
      await axios.patch(`${API_BASE_URL}/api/users/me/update`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      await fetchUserProfile();
    } catch (err) {
      console.error('Update failed:', err);
      setError({
        message: err.response?.data?.message || 'Failed to update profile',
        details: err.response?.data?.errors,
        status: err.response?.status,
      });
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorMessage
          error={error || 'User data not available'}
          title="Profile Error"
          dismissible={false}
        />
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
          {error && (
            <ErrorMessage
              error={error}
              title={error.status ? `Error (${error.status})` : 'Error'}
              dismissible
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          <ProfileBasicInfo
            user={user}
            loading={updateLoading}
            onProfileUpdate={handleProfileUpdate}
            validationErrors={validationErrors}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
{
  /* 
  
  
  Basic Usage

<ErrorMessage error="Something went wrong" />

With Error Object

<ErrorMessage error={new Error('Database connection failed')} />

API Error Response

<ErrorMessage error={{
  error: "Validation failed",
  errors: {
    email: "Must be a valid email",
    password: "Must be at least 8 characters"
  }
}} />

Dismissible Error

const [apiError, setApiError] = useState(null);

// When error occurs
setApiError("Failed to load data");

// In your 
{apiError && (
  <ErrorMessage 
    error={apiError} 
    dismissible 
    onDismiss={() => setApiError(null)}
  />
)}
Auto-dismissing Error

<ErrorMessage 
  error="Notification saved" 
  autoDismiss={3000} 
  dismissible
/>
With Additional Content

<ErrorMessage 
  error="Payment failed" 
  title="Transaction Error"
>
  <p className="mt-1">Please try again or contact support.</p>
  <button 
    onClick={retryPayment}
    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
  >
    Retry Payment
  </button>
</ErrorMessage>

Custom Styling

<ErrorMessage 
  error="Network error" 
  className="mb-4"
  dismissible
/>
  */
}

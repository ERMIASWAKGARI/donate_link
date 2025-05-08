import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal, Spin } from 'antd';

import ErrorMessage from '../../components/ErrorMessage';
import ProfileBasicInfo from '../../components/profile/ProfileBasicInfo';
import { validateProfile } from '../../components/profile/ProfileDataValidator';
import SuccessMessage from '../../components/SuccessMessage'; // Your new component
import api from '../../config/axiosConfig'; // Adjust the import path as necessary
import AdminLayout from './AdminLayout';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [verificationModal, setVerificationModal] = useState({
    visible: false,
    type: null, // 'email' or 'phone'
    message: '',
  });

  const formatFieldName = (field) => {
    // Handle known special cases
    const specialCases = {
      languagePreference: 'Language preference',
      servicePreference: 'Service preference',
      // Add other special cases as needed
    };

    if (specialCases[field]) {
      return specialCases[field];
    }

    // Default transformation for camelCase fields
    return (
      field
        // Insert space before capital letters
        .replace(/([A-Z])/g, ' $1')
        // Capitalize first letter of the string and letters following spaces
        .replace(/(?:^|\s)\S/g, (letter) => letter.toUpperCase())
        // Trim any extra spaces
        .trim()
    );
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users/me`, {
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
    const errors = validateProfile(user, updateData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError({
        message: `Validation failed: ${Object.values(errors).join(', ')}.`,
        details: 'Some fields contain invalid data',
        status: 400,
      });
      return;
    }

    try {
      setUpdateLoading(true);
      setError(null);
      const response = await api.patch('/users/me/update', updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const { data } = response;
      console.log('Update response:', data);

      if (data.message.updatedFields.includes('email')) {
        // Handle email verification flow
        setVerificationModal({
          visible: true,
          type: 'email',
          message: data.message,
        });
      } else if (data.message.updatedFields.includes('phone')) {
        // Handle phone verification flow
        setVerificationModal({
          visible: true,
          type: 'phone',
          message: data.message,
        });
      } else {
        // Regular success case
        setSuccess({
          message: data.message,
          updatedFields: data.message.updatedFields.map(formatFieldName),
        });
      }

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

  const handleProfilePictureUpload = async (file) => {
    console.log('Uploading profile picture:', file);
    try {
      setUpdateLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.patch(
        '/users/me/upload-profile-picture',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess({
        message: response.data.message,
        updatedFields: ['Profile picture :)'],
      });

      // Refresh the user data
      await fetchUserProfile();
    } catch (err) {
      console.error('Profile picture upload failed:', err);
      setError({
        message:
          err.response?.data?.message || 'Failed to upload profile picture',
        details: err.response?.data?.errors,
        status: err.response?.status,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // In ProfilePage.jsx, add this function
  const handleVerificationDocsSubmit = async (formData) => {
    try {
      setUpdateLoading(true);
      setError(null);

      const response = await api.patch(
        '/users/me/upload-verification-docs',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Verification docs upload response:', response.data);

      setSuccess({
        message:
          'Verification documents submitted successfully! Your account will be verified shortly.',
      });

      // Refresh the user data
      await fetchUserProfile();
    } catch (err) {
      console.error('Verification docs upload failed:', err);
      setError({
        message:
          err.response?.data?.message ||
          'Failed to upload verification documents',
        details: err.response?.data?.errors,
        status: err.response?.status,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleVerificationModalClose = () => {
    setVerificationModal({
      visible: false,
      type: null,
      message: '',
    });
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
    <AdminLayout>
      <div className="relative min-h-screen">
        <div className="container mx-auto px-4 pt-4">
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
        </div>

        {updateLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Spin size="large" />
          </div>
        )}

        {/* Verification Modal */}
        <Modal
          title={
            verificationModal.type === 'email'
              ? 'Email Verification Required'
              : 'Phone Verification Required'
          }
          visible={verificationModal.visible}
          onOk={handleVerificationModalClose}
          onCancel={handleVerificationModalClose}
          footer={[
            <button
              key="submit"
              onClick={handleVerificationModalClose}
              className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-600"
            >
              OK
            </button>,
          ]}
        >
          <div className="space-y-4">
            {verificationModal.type === 'email' ? (
              <>
                <p className="bg-blue-50 px-2 py-1 font-medium rounded-md">
                  Email Update Successful!
                </p>
                <p>
                  We&apos;ve sent a verification link to your new email address.
                </p>
                <p className="text-sm text-gray-600">
                  Please check your inbox and click the verification link to
                  complete the update.
                </p>
                <div className="bg-blue-50 p-3 rounded mt-3">
                  <p className="text-sm font-medium text-blue-800">
                    Didn&apos;t receive the email?
                  </p>
                  <ul className="list-disc pl-5 text-sm text-blue-700 mt-1">
                    <li>Check your spam folder</li>
                    <li>Wait a few minutes</li>
                    <li>Contact support if you still don&apos;t see it</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Phone Update Successful!</p>
                <p>We&apos;ve sent an OTP to your new phone number.</p>
                <p className="text-sm text-gray-600">
                  Please enter the verification code when prompted to complete
                  the update.
                </p>
              </>
            )}
          </div>
        </Modal>

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

            {success && !verificationModal.visible && (
              <SuccessMessage
                message={success.message}
                updatedFields={success.updatedFields}
                dismissible
                autoDismiss={5000}
                onDismiss={() => setSuccess(null)}
                className="mb-6"
              />
            )}

            <ProfileBasicInfo
              user={user}
              loading={updateLoading}
              onProfileUpdate={handleProfileUpdate}
              onProfilePictureUpload={handleProfilePictureUpload}
              onVerificationDocsSubmit={handleVerificationDocsSubmit} // Add this prop
              validationErrors={validationErrors}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;

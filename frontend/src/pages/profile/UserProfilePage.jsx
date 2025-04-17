/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import Header from '../../components/header/Header';
import { useUser } from '../../context/UserContext';

const UserProfilePage = () => {
  const { user, fetchUserDetails } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleUpdate = () => {
    fetchUserDetails(localStorage.getItem('accessToken'));
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            My Profile
          </h1>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'profile'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'settings'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Account Settings
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ProfileOverview user={user} />
            <div className="border-t my-6"></div>
            <ProfileEditor user={user} onUpdate={handleUpdate} />
            {(user.role === 'ngo' ||
              user.role === 'organization_donor' ||
              user.role === 'volunteer') && (
              <>
                <div className="border-t my-6"></div>
                <VerificationDocsSection user={user} />
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <AccountSettings user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileOverview = ({ user }) => {
  const formatRole = (role) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center">
        <img
          src={user.profilePicture || '/default-profile.png'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />
        <FileUpload
          endpoint="/api/users/upload-profile-picture"
          onSuccess={() => window.location.reload()}
          accept="image/*"
          className="mt-4"
        >
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors">
            Change Photo
          </button>
        </FileUpload>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {user.name}
        </h2>
        <p className="text-gray-600 mb-4">
          <span className="font-medium">Role:</span> {formatRole(user.role)}
        </p>

        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user.email}{' '}
            {user.isEmailVerified ? (
              <span className="text-green-600 text-sm">(Verified)</span>
            ) : (
              <span className="text-yellow-600 text-sm">(Not Verified)</span>
            )}
          </p>

          {user.phone && (
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {user.phone}{' '}
              {user.isPhoneVerified ? (
                <span className="text-green-600 text-sm">(Verified)</span>
              ) : (
                <span className="text-yellow-600 text-sm">(Not Verified)</span>
              )}
            </p>
          )}

          {user.address &&
            (user.address.city ||
              user.address.region ||
              user.address.country) && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-1">Address</h4>
                <p className="text-gray-700">
                  {[
                    user.address.city,
                    user.address.region,
                    user.address.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

          {/* Role-specific details */}
          {(user.role === 'individual_donor' ||
            user.role === 'organization_donor') && (
            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-medium">Donor Type:</span>{' '}
                {user.role === 'individual_donor'
                  ? 'Individual'
                  : 'Organization'}
              </p>
            </div>
          )}

          {user.role === 'organization_donor' && user.bankAccount && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-1">
                Bank Information
              </h4>
              <p className="text-gray-700">
                {user.bankAccount.bankName} - {user.bankAccount.account_number}
              </p>
            </div>
          )}

          {user.role === 'volunteer' && user.skills?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.role === 'ngo' && (
            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-medium">Verification Status:</span>{' '}
                {user.isVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending Verification</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileEditor = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || { country: '', region: '', city: '' },
    ...(user.role === 'volunteer' && {
      skills: user.skills || [],
      availability: user.availability || [],
    }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/me/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        onUpdate(data.data);
        // Show success notification
      }
    } catch (error) {
      console.error('Update error:', error);
      // Show error notification
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            value={formData.address.country}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Region/State
          </label>
          <input
            type="text"
            id="region"
            value={formData.address.region}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, region: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.address.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Volunteer-specific fields */}
      {user.role === 'volunteer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <SkillsInput
              skills={formData.skills}
              onChange={(skills) => setFormData({ ...formData, skills })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <AvailabilityInput
              availability={formData.availability}
              onChange={(availability) =>
                setFormData({ ...formData, availability })
              }
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const VerificationDocsSection = ({ user }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));

    try {
      const response = await fetch('/api/users/upload-verification-docs', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        // Show success notification
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Show error notification
    } finally {
      setIsUploading(false);
    }
  };

  const getDocsDescription = () => {
    switch (user.role) {
      case 'ngo':
        return 'Please upload your NGO registration documents for verification.';
      case 'organization_donor':
        return 'Please upload your organization license and tax documents.';
      case 'volunteer':
        return 'Please upload your ID card and any relevant certificates.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">
        Verification Documents
      </h3>
      <p className="text-gray-600">{getDocsDescription()}</p>

      <FileUpload
        multiple
        onUpload={handleUpload}
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={isUploading}
        className="w-full"
      >
        <button
          disabled={isUploading}
          className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </FileUpload>

      {/* Display uploaded documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Map through documents and display them */}
      </div>
    </div>
  );
};

const AccountSettings = ({ user }) => {
  const { logout } = useUser();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?'))
      return;

    setIsDeactivating(true);
    try {
      const response = await fetch('/api/users/me/deactivate', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        logout();
      }
    } catch (error) {
      console.error('Deactivation error:', error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'This will permanently delete your account. Are you sure?'
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/users/me/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        logout();
      }
    } catch (error) {
      console.error('Deletion error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Account Settings</h3>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm"
          >
            Change Password
          </button>
          {showPasswordForm && (
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          )}
        </div>

        <div className="border-b pb-4">
          <button
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className={`px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md shadow-sm ${
              isDeactivating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Your account will be temporarily disabled. You can reactivate later
            by logging in.
          </p>
        </div>

        <div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md shadow-sm ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            This action cannot be undone. All your data will be permanently
            removed from our systems.
          </p>
        </div>
      </div>
    </div>
  );
};

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess(true);
        setError('');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || 'Password change failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md">
          Password changed successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData({ ...formData, currentPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update Password
        </button>
      </div>
    </form>
  );
};

// You'll need to implement these components
const FileUpload = ({ children, ...props }) => {
  // Implementation for file upload component
  return <div {...props}>{children}</div>;
};

const SkillsInput = ({ skills, onChange }) => {
  // Implementation for skills input component
  return <div></div>;
};

const AvailabilityInput = ({ availability, onChange }) => {
  // Implementation for availability input component
  return <div></div>;
};

export default UserProfilePage;

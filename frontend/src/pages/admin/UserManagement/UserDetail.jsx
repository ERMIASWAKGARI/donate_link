import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  banUser,
  deleteUser,
  getUserById,
  rejectUser,
  unbanUser,
  verifyUser,
} from '../api/adminApi';
import StatusBadge from '../common/StatusBadge';
import VerificationPanel from './VerificationPanel';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user with ID:', id); // Debugging line
      try {
        const data = await getUserById(id);
        console.log('Fetched user data:', data); // Debugging line
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleVerify = async () => {
    try {
      await verifyUser(id);
      setUser((prev) => ({ ...prev, isVerified: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectUser(id, rejectionReason);
      setUser((prev) => ({ ...prev, isVerified: false }));
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBan = async () => {
    try {
      await banUser(id);
      setUser((prev) => ({ ...prev, isBanned: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser(id);
      setUser((prev) => ({ ...prev, isBanned: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      // Redirect to user list or show success message
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-indigo-100">{user.email}</p>
          </div>
          <div className="mt-3 md:mt-0 flex space-x-2">
            <StatusBadge
              isBanned={user.isBanned}
              isVerified={user.isVerified}
              className="bg-white/20 backdrop-blur-sm"
            />
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {user.isBanned ? (
            <button
              onClick={handleUnban}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Unban User
            </button>
          ) : (
            <button
              onClick={handleBan}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Ban User
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete User
          </button>
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Account Information */}
        <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-medium text-gray-800">{user._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joined Date:</span>
              <span className="font-medium text-gray-800">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-800">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Google ID:</span>
              <span className="font-medium text-gray-800">
                {user.googleId || 'Not linked'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Account Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Verified:</span>
              <span
                className={`font-medium ${
                  user.isVerified ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {user.isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Banned:</span>
              <span
                className={`font-medium ${
                  user.isBanned ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {user.isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Verified:</span>
              <span
                className={`font-medium ${
                  user.isEmailVerified ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {user.isEmailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone Verified:</span>
              <span
                className={`font-medium ${
                  user.isPhoneVerified ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {user.isPhoneVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-5 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">First Login:</span>
              <span
                className={`font-medium ${
                  user.isFirstLogin ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {user.isFirstLogin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Active:</span>
              <span
                className={`font-medium ${
                  user.isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deleted:</span>
              <span
                className={`font-medium ${
                  user.isDeleted ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {user.isDeleted ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token Version:</span>
              <span className="font-medium text-gray-800">
                {user.tokenVersion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Panel */}
      {!user.isVerified && (
        <div className="px-6 pb-6">
          <VerificationPanel
            onVerify={handleVerify}
            onReject={handleReject}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
          />
        </div>
      )}
    </div>
  );
};

export default UserDetail;

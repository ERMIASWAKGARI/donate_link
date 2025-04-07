import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Spinner from '../common/Spinner ';
import StatusBadge from '../common/StatusBadge';
import { useUserDetailHandlers } from './UserDetail/useUserDetailHandlers';
import VerificationDocsPanel from './UserDetail/VerificationDocsPanel';

const UserDetail = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    error,
    verificationDocs,
    docsLoading,
    handleVerify,
    handleReject,
    handleBan,
    handleUnban,
    getVerificationStatus,
    getBanStatus,
    getEmailStatus,
    getPhoneStatus,
    getAccountStatus,
    formatDate,
  } = useUserDetailHandlers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="indigo" />
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  const verificationStatus = getVerificationStatus();
  const banStatus = getBanStatus();
  const emailStatus = getEmailStatus();
  const phoneStatus = getPhoneStatus();
  const accountStatus = getAccountStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="mb-4 flex items-center text-white hover:text-indigo-200 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </button>
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
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-800">
                {formatDate(user.updatedAt)}
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
              <span className="text-gray-600">{verificationStatus.label}:</span>
              <span className={`font-medium ${verificationStatus.color}`}>
                {verificationStatus.text}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Banned:</span>
              <span className={`font-medium ${banStatus.color}`}>
                {banStatus.text}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className={`font-medium ${emailStatus.color}`}>
                {emailStatus.text}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className={`font-medium ${phoneStatus.color}`}>
                {phoneStatus.text}
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
              <span className="text-gray-600">Account Active:</span>
              <span className={`font-medium ${accountStatus.color}`}>
                {accountStatus.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Panel */}
      {user.role !== 'individual_donor' && (
        <div className="px-6 pb-6">
          {docsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="md" color="indigo" />
            </div>
          ) : verificationDocs ? (
            <VerificationDocsPanel
              docs={verificationDocs}
              user={user}
              userType={user.role}
              onVerify={handleVerify}
              onReject={() => {
                const reason = prompt('Please enter rejection reason:');
                if (reason) {
                  handleReject(reason);
                }
              }}
            />
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <p className="text-yellow-800">
                Verification documents not available
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Management Actions */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {user.isBanned ? (
            <button
              onClick={handleUnban}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
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
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
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
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

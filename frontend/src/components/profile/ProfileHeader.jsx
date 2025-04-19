/* eslint-disable react/prop-types */
import {
  CheckCircleOutlined,
  UploadOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import { getRoleTagColor, getVerificationStatus } from './profileUtils';

export const ProfileHeader = ({ user, profileCompletion }) => {
  const verificationStatus = getVerificationStatus(user.verificationStatus);

  return (
    <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative group mb-4 md:mb-0 md:mr-6">
          <div className="relative">
            <img
              className="h-32 w-32 rounded-full border-4 border-white border-opacity-80 shadow-md"
              src={
                user?.profilePicture
                  ? `http://localhost:5000/uploads/${user.profilePicture}`
                  : `https://ui-avatars.com/api/?name=${
                      user?.name || 'User'
                    }&background=ffffff&color=0891b2&size=256`
              }
              alt="Profile"
            />
            <button
              className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => {}}
            >
              <UploadOutlined className="text-white text-2xl" />
            </button>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
            <div
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                profileCompletion === 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {profileCompletion === 100
                ? '✓ Complete'
                : `${profileCompletion}%`}
            </div>
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start">
            {user.name}
            {user.isVerified && (
              <VerifiedOutlined className="ml-2 text-yellow-300" />
            )}
          </h1>
          <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleTagColor(
                user.role
              )}`}
            >
              {user.role.replace('_', ' ')}
            </span>
            {user.role !== 'admin' && user.role !== 'individual_donor' && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${verificationStatus.color}`}
              >
                {verificationStatus.icon && (
                  <CheckCircleOutlined
                    className={`mr-1 ${verificationStatus.icon}`}
                  />
                )}
                <span className="ml-1">{verificationStatus.text}</span>
              </span>
            )}
          </div>

          <div className="mt-4 w-full md:w-64">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  profileCompletion === 100 ? 'bg-green-500' : 'bg-teal-500'
                }`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <div className="text-xs text-white text-opacity-90 mt-1">
              Profile {profileCompletion}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

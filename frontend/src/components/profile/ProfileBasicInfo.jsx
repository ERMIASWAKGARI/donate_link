/* eslint-disable react/prop-types */
import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  SaveOutlined,
  SolutionOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ProfileBasicInfo = ({ user, onProfileUpdate }) => {
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate profile completion percentage
  useEffect(() => {
    let completedFields = 0;
    const totalFields = 6; // name, email, phone, address, bio, dob

    if (user?.name) completedFields++;
    if (user?.email && user?.isEmailVerified) completedFields++;
    if (user?.phone && user?.isPhoneVerified) completedFields++;
    if (user?.address) completedFields++;
    if (user?.bio) completedFields++;
    if (user?.dob) completedFields++;

    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  }, [user]);

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleSaveField = async (fieldName) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEditingField(null);
      onProfileUpdate?.();
    } catch (error) {
      console.error(`Failed to update ${fieldName}`, error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTagColor = () => {
    switch (user.role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'ngo':
        return 'bg-teal-100 text-teal-800';
      case 'volunteer':
        return 'bg-blue-100 text-blue-800';
      case 'organization_donor':
        return 'bg-green-100 text-green-800';
      case 'individual_donor':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatus = (status) => {
    switch (status) {
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircleOutlined className="text-green-500" />,
          text: 'Verified',
        };
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: <ClockCircleOutlined className="text-amber-500" />,
          text: 'Pending',
        };
      case 'not_verified':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <CloseCircleOutlined className="text-red-500" />,
          text: 'Not Verified',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: null,
          text: 'Unknown',
        };
    }
  };

  const renderEditButton = (fieldName) => (
    <button
      onClick={() => setEditingField(fieldName)}
      className="text-teal-600 hover:text-teal-800 transition-colors"
    >
      <EditOutlined className="mr-1" />
      Edit
    </button>
  );

  const renderSaveCancelButtons = (fieldName) => (
    <div className="flex space-x-2">
      <button
        onClick={handleCancelEdit}
        disabled={loading}
        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
      >
        <CloseOutlined className="mr-1" />
        Cancel
      </button>
      <button
        onClick={() => handleSaveField(fieldName)}
        disabled={loading}
        className="text-teal-600 hover:text-teal-800 disabled:opacity-50"
      >
        <SaveOutlined className="mr-1" />
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );

  const renderField = (fieldName, label, value, editComponent) => (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {editingField === fieldName
          ? renderSaveCancelButtons(fieldName)
          : renderEditButton(fieldName)}
      </div>

      {editingField === fieldName ? (
        editComponent
      ) : (
        <div className="mt-1 flex items-center">
          <span className="text-gray-900">
            {value || <span className="text-gray-400">Not provided</span>}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Header */}
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
                    onClick={() => {
                      /* Handle upload */
                    }}
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleTagColor()}`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                  {user.role !== 'admin' &&
                    user.role !== 'individual_donor' && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
                          getVerificationStatus(user.verificationStatus).color
                        }`}
                      >
                        {getVerificationStatus(user.verificationStatus).icon}
                        <span className="ml-1">
                          {getVerificationStatus(user.verificationStatus).text}
                        </span>
                      </span>
                    )}
                </div>

                <div className="mt-4 w-full md:w-64">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        profileCompletion === 100
                          ? 'bg-green-500'
                          : 'bg-teal-500'
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

          {/* Profile Content */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <UserOutlined className="mr-2 text-teal-500" />
                  Basic Information
                </h2>

                {/* Name */}
                {renderField(
                  'name',
                  'Full Name',
                  user.name,
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  />
                )}

                {/* Email */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                  </div>
                  <div className="mt-1 flex items-center">
                    <MailOutlined className="text-gray-500 mr-2" />
                    <span className="text-gray-900">{user.email}</span>
                    {user.isEmailVerified ? (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleOutlined className="mr-1 text-green-500" />
                        Verified
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <CloseCircleOutlined className="mr-1 text-amber-500" />
                        Not Verified
                        <button
                          onClick={() => {
                            /* Handle verification */
                          }}
                          className="ml-2 text-amber-600 hover:text-amber-800 text-xs"
                        >
                          Verify Now
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                {renderField(
                  'phone',
                  'Phone Number',
                  user.phone,
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="tel"
                      defaultValue={user.phone}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneOutlined className="text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                {user.role !== 'admin' &&
                  user.role !== 'individual_donor' &&
                  !user.isVerified && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <IdcardOutlined className="text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Account Verification:{' '}
                            {
                              getVerificationStatus(user.verificationStatus)
                                .text
                            }
                          </h4>
                          {user.verificationStatus === 'not_verified' && (
                            <p className="mt-1 text-xs text-blue-600">
                              Submit verification documents to get verified and
                              access all features.
                            </p>
                          )}
                          {user.verificationStatus === 'pending' && (
                            <p className="mt-1 text-xs text-blue-600">
                              Your documents are under review. This process
                              typically takes 2-3 business days.
                            </p>
                          )}
                          {user.verificationStatus === 'not_verified' && (
                            <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Submit Documents
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Date of Birth */}
                {renderField(
                  'dob',
                  'Date of Birth',
                  user.dob ? dayjs(user.dob).format('MMMM D, YYYY') : null,
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="date"
                      defaultValue={user.dob}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarOutlined className="text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Gender */}
                {renderField(
                  'gender',
                  'Gender',
                  user.gender ? user.gender.replace(/-/g, ' ') : null,
                  <select
                    defaultValue={user.gender}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                )}

                {/* Address */}
                {renderField(
                  'address',
                  'Address',
                  user.address,
                  <div className="relative rounded-md shadow-sm">
                    <textarea
                      defaultValue={user.address}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="123 Main St, City, Country"
                    />
                    <div className="absolute top-3 left-3">
                      <EnvironmentOutlined className="text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Bio */}
                {renderField(
                  'bio',
                  'About Me',
                  user.bio,
                  <textarea
                    defaultValue={user.bio}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Tell us about yourself..."
                  />
                )}
              </div>
            </div>

            {/* Right Column - Role Specific Info */}
            <div>
              <div className="bg-gray-50 p-6 rounded-xl sticky top-6">
                {user.role === 'volunteer' && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <TeamOutlined className="mr-2 text-teal-500" />
                      Volunteer Information
                    </h2>

                    {renderField(
                      'skills',
                      'Skills',
                      user.skills?.join(', '),
                      <select
                        multiple
                        defaultValue={user.skills}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      >
                        <option value="First Aid">First Aid</option>
                        <option value="Teaching">Teaching</option>
                        <option value="Construction">Construction</option>
                        <option value="Medical">Medical</option>
                        <option value="Translation">Translation</option>
                      </select>
                    )}

                    {renderField(
                      'availability',
                      'Availability',
                      user.availability,
                      <select
                        defaultValue={user.availability}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                      >
                        <option value="">Select availability</option>
                        <option value="Weekdays">Weekdays</option>
                        <option value="Weekends">Weekends</option>
                        <option value="Both">Both</option>
                      </select>
                    )}
                  </>
                )}

                {user.role === 'ngo' && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <BankOutlined className="mr-2 text-teal-500" />
                      NGO Information
                    </h2>

                    {renderField(
                      'organizationName',
                      'Organization Name',
                      user.organizationName,
                      <input
                        type="text"
                        defaultValue={user.organizationName}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    )}

                    {renderField(
                      'missionStatement',
                      'Mission Statement',
                      user.missionStatement,
                      <textarea
                        defaultValue={user.missionStatement}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    )}
                  </>
                )}

                {(user.role === 'individual_donor' ||
                  user.role === 'organization_donor') && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <SolutionOutlined className="mr-2 text-teal-500" />
                      Donor Information
                    </h2>

                    {user.role === 'organization_donor' &&
                      renderField(
                        'organizationName',
                        'Organization Name',
                        user.organizationName,
                        <input
                          type="text"
                          defaultValue={user.organizationName}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                      )}

                    {renderField(
                      'preferredDonations',
                      'Preferred Donations',
                      user.preferredDonations?.join(', '),
                      <select
                        multiple
                        defaultValue={user.preferredDonations}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      >
                        <option value="Money">Money</option>
                        <option value="Food">Food</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Medical Supplies">
                          Medical Supplies
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <SafetyOutlined className="mr-2 text-teal-500" />
                      Admin Information
                    </h2>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700">
                        Admin Level
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {user.adminLevel || 'Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700">
                        Last System Action
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {user.lastAction || 'No recent actions'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBasicInfo;

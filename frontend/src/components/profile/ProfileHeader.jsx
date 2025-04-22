/* eslint-disable react/prop-types */
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Modal, message } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const ProfileHeader = ({
  user,
  onProfilePictureUpload,
  onVerificationDocsSubmit,
}) => {
  const [isVerificationModalVisible, setIsVerificationModalVisible] =
    useState(false);
  const [verificationDocs, setVerificationDocs] = useState({});
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Determine if we should show the verification prompt
  const shouldShowVerificationPrompt =
    (user.role === 'organization_donor' ||
      user.role === 'volunteer' ||
      user.role === 'ngo') &&
    !user.isVerified &&
    user.verificationStatus === 'not_verified';

  const getVerificationStatus = (status) => {
    switch (status) {
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800',
          icon: 'text-green-500',
          text: 'Verified',
        };
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: 'text-amber-500',
          text: 'Pending',
        };
      case 'not_verified':
        return {
          color: 'bg-red-100 text-red-800',
          icon: 'text-red-500',
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

  const verificationStatus = getVerificationStatus(user.verificationStatus);

  // Validate a single file
  const validateFile = (file) => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) return { isValid: false, error: 'File is required' };
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG, PNG, GIF images or PDF files are allowed',
      };
    }
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size should be less than 10MB' };
    }
    return { isValid: true, error: null };
  };

  // Validate all required documents before submission
  const validateAllDocuments = () => {
    const errors = {};
    let isValid = true;

    // Validate based on user role
    if (user.role === 'volunteer') {
      if (!verificationDocs.idCard) {
        errors.idCard = 'ID Card is required';
        isValid = false;
      }
      if (!verificationDocs.trainingCertificate) {
        errors.trainingCertificate = 'Training Certificate is required';
        isValid = false;
      }
    } else if (user.role === 'ngo') {
      if (!verificationDocs.registrationCertificate) {
        errors.registrationCertificate = 'Registration Certificate is required';
        isValid = false;
      }
      if (!verificationDocs.authorizationLetter) {
        errors.authorizationLetter = 'Authorization Letter is required';
        isValid = false;
      }
    } else if (user.role === 'organization_donor') {
      if (!verificationDocs.licenseCertificate) {
        errors.licenseCertificate = 'License Certificate is required';
        isValid = false;
      }
      if (!verificationDocs.taxCertificate) {
        errors.taxCertificate = 'Tax Certificate is required';
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        message.error('Please upload a valid image file (JPEG, PNG, GIF)');
        return;
      }

      if (file.size > maxSize) {
        message.error('Image size should be less than 10MB');
        return;
      }

      onProfilePictureUpload(file);
    }
  };

  const handleVerificationDocsChange = (fieldName, file) => {
    const { isValid, error } = validateFile(file);

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    if (isValid) {
      setVerificationDocs((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    } else {
      // Remove the invalid file from state
      setVerificationDocs((prev) => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    }
  };
  const handleVerificationSubmit = async () => {
    // Validate all required documents first
    if (!validateAllDocuments()) {
      message.error('Please upload all required documents');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      // Add the specific docs based on user role
      if (user.role === 'volunteer') {
        formData.append('idCard', verificationDocs.idCard);
        formData.append(
          'trainingCertificate',
          verificationDocs.trainingCertificate
        );
      } else if (user.role === 'ngo') {
        formData.append(
          'registrationCertificate',
          verificationDocs.registrationCertificate
        );
        formData.append(
          'authorizationLetter',
          verificationDocs.authorizationLetter
        );
      } else if (user.role === 'organization_donor') {
        formData.append(
          'licenseCertificate',
          verificationDocs.licenseCertificate
        );
        formData.append('taxCertificate', verificationDocs.taxCertificate);
      }

      // Add any additional docs
      if (verificationDocs.additionalDocs) {
        verificationDocs.additionalDocs.forEach((file) => {
          formData.append('additionalDocs', file);
        });
      }

      await onVerificationDocsSubmit(formData);
      setIsVerificationModalVisible(false);
      setVerificationDocs({});
      setValidationErrors({});
    } catch (error) {
      console.error('Error submitting verification docs:', error);
      message.error('Failed to submit documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalDocsChange = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      return validateFile(file).isValid;
    });

    setVerificationDocs((prev) => ({
      ...prev,
      additionalDocs: validFiles.length > 0 ? validFiles : undefined,
    }));
  };

  // Simplified submit disabled check
  const isSubmitDisabled = () => {
    const hasErrors = Object.values(validationErrors).some((error) => error);
    if (hasErrors) return true;

    switch (user.role) {
      case 'volunteer':
        return (
          !verificationDocs.idCard || !verificationDocs.trainingCertificate
        );
      case 'ngo':
        return (
          !verificationDocs.registrationCertificate ||
          !verificationDocs.authorizationLetter
        );
      case 'organization_donor':
        return (
          !verificationDocs.licenseCertificate ||
          !verificationDocs.taxCertificate
        );
      default:
        return true;
    }
  };

  const renderVerificationForm = () => {
    switch (user.role) {
      case 'volunteer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Card (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange('idCard', e.target.files[0])
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.idCard && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.idCard}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Certificate (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange(
                    'trainingCertificate',
                    e.target.files[0]
                  )
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.trainingCertificate && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.trainingCertificate}
                </p>
              )}
            </div>
          </div>
        );
      case 'ngo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Certificate (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange(
                    'registrationCertificate',
                    e.target.files[0]
                  )
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.registrationCertificate && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.registrationCertificate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Letter (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange(
                    'authorizationLetter',
                    e.target.files[0]
                  )
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.authorizationLetter && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.authorizationLetter}
                </p>
              )}
            </div>
          </div>
        );
      case 'organization_donor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Certificate (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange(
                    'licenseCertificate',
                    e.target.files[0]
                  )
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.licenseCertificate && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.licenseCertificate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Certificate (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleVerificationDocsChange(
                    'taxCertificate',
                    e.target.files[0]
                  )
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
              />
              {validationErrors.taxCertificate && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.taxCertificate}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Verification Prompt Banner */}
      {shouldShowVerificationPrompt && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-yellow-500 text-xl mr-3" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700">
                Your account needs to be verified. Please upload the required
                documents to complete verification.
              </p>
            </div>
            <button
              onClick={() => setIsVerificationModalVisible(true)}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Upload Documents
            </button>
          </div>
        </div>
      )}

      {/* Main Profile Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center w-full flex-wrap">
          {/* Left: Profile Info */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative group mb-4 md:mb-0 md:mr-6">
              <div className="relative">
                <img
                  className="h-32 w-32 rounded-full border-2 border-yellow-400 border-opacity-80 shadow-md"
                  src={
                    user?.profilePicture
                      ? `http://localhost:5000/uploads/${user.profilePicture}`
                      : `https://ui-avatars.com/api/?name=${
                          user?.name || 'User'
                        }&background=ffffff&color=0891b2&size=256`
                  }
                  alt="Profile"
                />
                <label
                  htmlFor="profilePictureUpload"
                  className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                >
                  <UploadOutlined className="text-white text-2xl" />
                  <input
                    id="profilePictureUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center justify-center md:justify-start">
                {user.name}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-teal-700`}
                >
                  {user.role
                    .replace('_', ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
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
            </div>
          </div>

          {/* Right: Settings Link */}
          <div className="relative group mt-4 md:mt-0">
            {user.role === 'admin' ? (
              <Link
                to="/admin/account/settings"
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300"
              >
                <SettingOutlined className=" text-lg" />
                <span className="text-sm font-medium hidden sm:inline">
                  Settings
                </span>
              </Link>
            ) : (
              <Link
                to="/account/settings"
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300"
              >
                <SettingOutlined className=" text-lg" />
                <span className="text-sm font-medium hidden sm:inline">
                  Settings
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Verification Documents Modal */}
      <Modal
        title={`Upload Verification Documents (${user.role.replace('_', ' ')})`}
        visible={isVerificationModalVisible}
        onCancel={() => {
          setIsVerificationModalVisible(false);
          setVerificationDocs({});
          setValidationErrors({});
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setIsVerificationModalVisible(false);
              setVerificationDocs({});
              setValidationErrors({});
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleVerificationSubmit}
            disabled={isSubmitDisabled()}
            style={{
              backgroundColor: '#facc15', // Tailwind's bg-yellow-400
              color: '#14532d', // Tailwind's text-green-900
              padding: '4px 12px', // Tailwind's px-3 py-1 = 0.75rem x 0.25rem
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            Submit Documents
          </Button>,
        ]}
        width={800}
      >
        {renderVerificationForm()}

        {/* Additional Documents Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Documents (Optional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleAdditionalDocsChange(e.target.files)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-[#008080] hover:file:bg-teal-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            You can upload multiple additional documents (JPEG, PNG, GIF, PDF)
            up to 10MB each.
          </p>
          {verificationDocs.additionalDocs?.length > 0 && (
            <p className="mt-1 text-sm text-green-600">
              {verificationDocs.additionalDocs.length} additional document(s)
              selected
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

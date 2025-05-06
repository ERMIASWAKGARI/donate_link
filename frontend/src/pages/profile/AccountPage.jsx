/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spin } from 'antd';

import ErrorMessage from '../../components/ErrorMessage';
import Header from '../../components/header/Header';
import SuccessMessage from '../../components/SuccessMessage';
import { useUser } from './../../context/UserContext';

const ConfirmModal = ({ open, onClose, onConfirm, title, description }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useUser();
  const [activeTab, setActiveTab] = useState('password');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccessMsg('Password changed successfully. You will be logged out.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => logout(), 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/me/deactivate',
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to deactivate');

      setSuccessMsg('Account deactivated successfully. Logging out...');
      setTimeout(() => logout(), 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setIsDeleting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/me/delete',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Failed to delete account');

      setSuccessMsg('Account deleted successfully.');
      setTimeout(() => logout(), 4000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#008080] hover:text-[#006666] transition-colors mb-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Go Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <Spin size="large" />
          </div>
        )}
        <div className="flex border-b border-gray-200 mb-6 text-sm font-medium">
          {['password', 'danger'].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 transition-colors ${
                activeTab === tab
                  ? 'text-[#008080] border-b-2 border-[#008080] bg-teal-50'
                  : 'text-gray-500 hover:text-[#008080]'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'password' ? 'Change Password' : 'Account Actions'}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {successMsg && (
            <SuccessMessage
              message={successMsg}
              dismissible
              autoDismiss={4000}
              onDismiss={() => setSuccessMsg(null)}
            />
          )}
          {errorMsg && (
            <ErrorMessage
              error={errorMsg}
              dismissible
              autoDismiss={6000}
              onDismiss={() => setErrorMsg(null)}
            />
          )}
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'password' ? (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {[
                { label: 'Current Password', name: 'currentPassword' },
                { label: 'New Password', name: 'newPassword' },
                { label: 'Confirm New Password', name: 'confirmPassword' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="password"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3ea8a8e8] transition"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="flex items-center text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
              >
                Change Password
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Deactivate */}
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Deactivate Account
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Temporarily disable your account. You can reactivate it by
                  logging in again.
                </p>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  disabled={!user.isActive || isDeactivating}
                  className={`flex items-center gap-1  px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
                    isDeactivating || !user.isActive
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'text-yellow-600 hover:text-white hover:bg-yellow-500 border border-yellow-500'
                  }`}
                >
                  {isDeactivating ? 'Processing...' : 'Deactivate'}
                </button>
              </div>

              {/* Delete */}
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Delete Account
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Permanently delete your account. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={!user.isActive || isDeleting}
                  className={`flex items-center gap-1  px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
                    isDeleting || !user.isActive
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'text-red-500 hover:text-white hover:bg-red-500 border border-red-500'
                  }`}
                >
                  {isDeleting ? 'Processing...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your account?"
      />
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        description="This action is irreversible. Do you really want to permanently delete your account?"
      />
    </div>
  );
};

export default AccountPage;

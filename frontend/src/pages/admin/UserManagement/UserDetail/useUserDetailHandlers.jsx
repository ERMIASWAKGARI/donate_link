import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  banUser,
  getUserById,
  getVerificationDocuments,
  rejectUser,
  unbanUser,
  verifyUser,
} from '../../api/adminApi';

export const useUserDetailHandlers = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const fetchVerificationDocs = async (userId) => {
    setDocsLoading(true);
    try {
      const docs = await getVerificationDocuments(userId);
      console.log(docs);
      setVerificationDocs(docs);
    } catch (err) {
      console.error('Error fetching verification docs:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  // Data fetching
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
        // Fetch verification docs if needed
        if (['ngo', 'organization_donor', 'volunteer'].includes(data.role)) {
          await fetchVerificationDocs(id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Action handlers
  const handleVerify = async () => {
    try {
      await verifyUser(id);
      setUser((prev) => ({ ...prev, isVerified: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (rejectionReason) => {
    try {
      await rejectUser(id, rejectionReason);
      fetchVerificationDocs(id); // Refresh verification docs
      setUser((prev) => ({ ...prev, isVerified: false }));
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

  // Status getters
  const getVerificationStatus = () => {
    if (!user)
      return { label: 'Status', text: 'Loading...', color: 'text-gray-500' };

    if (['organization_donor', 'volunteer', 'ngo'].includes(user.role)) {
      return {
        label: 'Verification Status',
        text: user.isVerified ? 'Verified' : 'Not Verified',
        color: user.isVerified ? 'text-[#008080]' : 'text-red-500',
      };
    }
    return {
      label: 'Verification Status',
      text: "Doesn't need verification",
      color: 'text-gray-700',
    };
  };

  const getBanStatus = () => ({
    text: user?.isBanned ? 'Banned' : 'Not Banned',
    color: user?.isBanned ? 'text-red-500' : 'text-[#008080]',
  });

  const getEmailStatus = () => {
    if (!user?.email) return { text: 'Not provided', color: 'text-gray-400' };
    return user.isEmailVerified
      ? { text: 'Verified', color: 'text-[#008080]' }
      : { text: 'Pending verification', color: 'text-yellow-500' };
  };

  const getPhoneStatus = () => {
    if (!user?.phone) return { text: 'Not provided', color: 'text-gray-400' };
    return user.isPhoneVerified
      ? { text: 'Verified', color: 'text-[#008080]' }
      : { text: 'Pending verification', color: 'text-yellow-500' };
  };

  const getAccountStatus = () => ({
    text: user?.isActive ? 'Active' : 'Inactive',
    color: user?.isActive ? 'text-[#008080]' : 'text-red-600',
  });

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return {
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
  };
};

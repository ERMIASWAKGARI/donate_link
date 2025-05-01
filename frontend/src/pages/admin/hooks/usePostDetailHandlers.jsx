import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { banPost, getPostById, unbanPost } from '../../admin/api/adminApi';

// hooks/usePostDetailHandlers.js
export const usePostDetailHandlers = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleBanPost = async () => {
    try {
      await banPost(id);
      setPost((prev) => ({ ...prev, isBanned: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnbanPost = async () => {
    try {
      await unbanPost(id);
      setPost((prev) => ({ ...prev, isBanned: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const getPostStatus = () => {
    if (!post) return { text: 'Loading...', color: 'text-gray-500' };

    if (post.isBanned) {
      return { text: 'Banned', color: 'text-red-500' };
    }

    if (post.postType === 'donation') {
      switch (post.status) {
        case 'pending':
          return { text: 'Pending', color: 'text-yellow-500' };
        case 'requested':
          return { text: 'Requested', color: 'text-blue-500' };
        case 'accepted':
          return { text: 'Accepted', color: 'text-[#008080]' };
        case 'rejected':
          return { text: 'Rejected', color: 'text-red-500' };
        case 'completed':
          return { text: 'Completed', color: 'text-green-500' };
        default:
          return { text: 'Posted', color: 'text-gray-500' };
      }
    } else {
      switch (post.status) {
        case 'Open':
          return { text: 'Open', color: 'text-[#008080]' };
        case 'Fulfilled':
          return { text: 'Fulfilled', color: 'text-green-500' };
        case 'Expired':
          return { text: 'Expired', color: 'text-red-500' };
        case 'Closed':
          return { text: 'Closed', color: 'text-gray-500' };
        default:
          return { text: 'Unknown', color: 'text-gray-500' };
      }
    }
  };

  const getPostType = () => {
    if (!post) return { text: 'Loading...', color: 'bg-gray-500' };

    return post.postType === 'donation'
      ? { text: 'Donation', color: 'bg-green-500' }
      : { text: 'Need', color: 'bg-blue-500' };
  };

  const getDonationDetails = () => {
    if (!post || post.postType !== 'donation') return null;

    return {
      type: post.donationType,
      amount:
        post.donationType === 'money'
          ? `${post.amount} ${post.currency}`
          : null,
      materialDetails:
        post.donationType === 'material' ? post.materialDetails : null,
      serviceDetails:
        post.donationType === 'service' ? post.serviceDetails : null,
      address: post.address,
      trackingId: post.trackingId,
    };
  };

  const getNeedDetails = () => {
    if (!post || post.postType !== 'need') return null;

    return {
      needTypes: post.needTypes,
      urgency: post.urgencyLevel,
      targetMoney: post.targetMoney,
      endDate: post.endDate,
      beneficiaryInfo: post.beneficiaryInfo,
      categories: post.categories,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    post,
    loading,
    error,
    formatDate,
    getPostStatus,
    getPostType,
    getDonationDetails,
    getNeedDetails,
    handleBanPost,
    handleUnbanPost,
  };
};

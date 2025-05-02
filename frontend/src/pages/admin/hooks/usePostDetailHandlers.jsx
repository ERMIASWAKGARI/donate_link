import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../../admin/api/adminApi';

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
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

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
  };
};

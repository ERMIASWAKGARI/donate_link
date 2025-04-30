import { useEffect, useState } from 'react';
import { getAllPosts } from '../api/adminApi';

const useDashboardPosts = (fetchAll = false) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Use null limit when fetchAll is true
      const response = await getAllPosts(1, '', '', fetchAll ? null : 10);
      setPosts(response.posts || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchAll]);

  return {
    posts,
    loading,
    error,
    totalCount,
    refetch: fetchPosts,
  };
};

export default useDashboardPosts;

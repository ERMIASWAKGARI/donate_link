// hooks/useDashboardUsers.js
import { useEffect, useState } from 'react';
import { getAllUsers } from '../api/adminApi';

const useDashboardUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(1); // Always fetch first page for dashboard
      setUsers(response.users || []);
      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
  };
};

export default useDashboardUsers;

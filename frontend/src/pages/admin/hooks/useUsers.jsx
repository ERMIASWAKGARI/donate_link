import { useEffect, useState } from 'react';
import { getAllUsers, searchUsers } from '../api/adminApi';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (page = 1, query = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = query
        ? await searchUsers(query, page)
        : await getAllUsers(page);

      setUsers(response.users || []);

      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
          totalItems: response.pagination.totalItems || 0,
          itemsPerPage: response.pagination.itemsPerPage || 9,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchUsers(1, query);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchQuery);
  };

  return {
    users,
    loading,
    error,
    pagination,
    searchUsers: handleSearch,
    changePage: handlePageChange,
    refetch: () => fetchUsers(pagination.currentPage, searchQuery),
  };
};

export default useUsers;

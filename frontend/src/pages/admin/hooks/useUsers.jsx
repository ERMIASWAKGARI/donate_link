// hooks/useUsers.js
import { useEffect, useState } from 'react';
import { getAllUsers, getUsersByRole, searchUsers } from '../api/adminApi';

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
  const [selectedRole, setSelectedRole] = useState('');

  const fetchUsers = async (page = 1, query = '', role = '') => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (role && role !== '') {
        response = await getUsersByRole(role, page);
      } else {
        response = query
          ? await searchUsers(query, page)
          : await getAllUsers(page);
      }

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
    setSelectedRole(''); // Clear selected role when searching
    fetchUsers(1, query);
    setSearchQuery(''); // Clear the search query after fetching
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    fetchUsers(1, searchQuery, role);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchQuery, selectedRole);
  };

  return {
    users,
    loading,
    error,
    pagination,
    selectedRole,
    handleSearch,
    changeRole: handleRoleChange,
    changePage: handlePageChange,
    refetch: () =>
      fetchUsers(pagination.currentPage, searchQuery, selectedRole),
  };
};

export default useUsers;

// hooks/useUsers.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getAllUsers, getUsersByRole, searchUsers } from '../api/adminApi';

const useUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam) : 1;

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

  const fetchUsers = async (page = initialPage, query = '', role = '') => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);

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
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get('search') || '';
    const initialRole = params.get('role') || '';
    const initialPage = params.get('page') || 1;
    fetchUsers(initialPage, initialSearch, initialRole);
  }, []);

  const handleSearch = (query) => {
    const params = new URLSearchParams(window.location.search);
    params.set('search', query);
    params.delete('page'); // Reset to page 1 when searching
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setSearchQuery(query);
    setSelectedRole(''); // Clear selected role when searching
    fetchUsers(1, query);
    setSearchQuery(''); // Clear the search query after fetching
  };

  const handleRoleChange = (role) => {
    const params = new URLSearchParams(window.location.search);
    params.set('role', role);
    params.delete('page'); // Reset to page 1 when changing role
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
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

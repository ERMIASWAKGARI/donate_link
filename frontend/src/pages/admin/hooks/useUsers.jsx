// hooks/useUsers.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  getAllUsers,
  unbanUser,
} from '../api/adminApi';

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
  const [selectedSort, setSelectedSort] = useState('');

  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const fetchUsers = async (
    page = initialPage,
    query = '',
    role = '',
    sort = '',
    verified = '',
    banned = '',
    active = ''
  ) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (query) params.set('search', query);
    if (role) params.set('role', role);
    if (sort) params.set('sort', sort);
    if (verified) params.set('verified', verified);
    if (banned) params.set('banned', banned);
    if (active) params.set('active', active);

    setSearchParams(params);
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params}`
    );

    setLoading(true);
    setError(null);

    try {
      const response = await getAllUsers(
        page,
        role,
        sort,
        query,
        verified,
        banned,
        active
      );

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

    // Only read params if they exist, otherwise use defaults
    const initialSearch = params.has('search') ? params.get('search') : '';
    const initialRole = params.has('role') ? params.get('role') : '';
    const initialSort = params.has('sort') ? params.get('sort') : '';
    const initialPage = params.has('page') ? params.get('page') : 1;

    const initialVerified = params.has('verified')
      ? params.get('verified')
      : '';
    const initialBanned = params.has('banned') ? params.get('banned') : '';
    const initialActive = params.has('active') ? params.get('active') : '';

    setSearchQuery(initialSearch);
    setSelectedRole(initialRole);
    setSelectedSort(initialSort);

    setVerifiedFilter(initialVerified);
    setBannedFilter(initialBanned);
    setActiveFilter(initialActive);

    fetchUsers(
      initialPage,
      initialSearch,
      initialRole,
      initialSort,
      initialVerified,
      initialBanned,
      initialActive
    );
  }, []);

  const handleSearch = (query) => {
    const params = new URLSearchParams(window.location.search);
    params.set('search', query);
    params.delete('page'); // Reset to page 1 when searching
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setUsers([]); // Clear users when searching
    setSearchQuery(query);
    fetchUsers(
      1,
      query,
      selectedRole,
      selectedSort,
      verifiedFilter,
      bannedFilter,
      activeFilter
    );
  };

  const handleRoleChange = (role) => {
    const params = new URLSearchParams(window.location.search);
    params.set('role', role);
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setUsers([]); // Clear users when changing role
    setSelectedRole(role);
    fetchUsers(
      1,
      searchQuery,
      role,
      selectedSort,
      verifiedFilter,
      bannedFilter,
      activeFilter
    );
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(window.location.search);
    params.set('sort', sort);
    params.set('page', 1); // Reset to page 1 when sorting
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setSelectedSort(sort);
    setUsers([]); // Clear users when changing sort
    fetchUsers(
      1,
      searchQuery,
      selectedRole,
      sort,
      verifiedFilter,
      bannedFilter,
      activeFilter
    );
  };

  // Add these new handler functions
  const handleVerifiedChange = (value) => {
    const params = new URLSearchParams(window.location.search);
    params.set('verified', value);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setVerifiedFilter(value);
    fetchUsers(
      1,
      searchQuery,
      selectedRole,
      selectedSort,
      value,
      bannedFilter,
      activeFilter
    );
  };

  const handleBannedChange = (value) => {
    const params = new URLSearchParams(window.location.search);
    params.set('banned', value);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setBannedFilter(value);
    fetchUsers(
      1,
      searchQuery,
      selectedRole,
      selectedSort,
      verifiedFilter,
      value,
      activeFilter
    );
  };

  const handleActiveChange = (value) => {
    const params = new URLSearchParams(window.location.search);
    params.set('active', value);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setActiveFilter(value);
    fetchUsers(
      1,
      searchQuery,
      selectedRole,
      selectedSort,
      verifiedFilter,
      bannedFilter,
      value
    );
  };

  const handlePageChange = (page) => {
    fetchUsers(
      page,
      searchQuery,
      selectedRole,
      selectedSort,
      verifiedFilter,
      bannedFilter,
      activeFilter
    );
  };

  const resetAllFilters = () => {
    // Create clean URL with just page=1
    const cleanParams = new URLSearchParams();
    cleanParams.set('page', '1');

    // Update URL first - this is crucial
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${cleanParams}`
    );
    setSearchParams(cleanParams);

    // Then clear all state
    setSearchQuery('');
    setSelectedRole('');
    setSelectedSort('');
    setUsers([]);

    setVerifiedFilter('');
    setBannedFilter('');
    setActiveFilter('');
    fetchUsers(1, '', '', '', '', '', '');
  };

  const banSingleUser = async (userId) => {
    try {
      await banUser(userId);
      await fetchUsers(
        pagination.currentPage,
        searchQuery,
        selectedRole,
        selectedSort,
        verifiedFilter,
        bannedFilter,
        activeFilter
      );
      return true;
    } catch (err) {
      setError(err.message || 'Failed to ban user');
      return false;
    }
  };

  const unbanSingleUser = async (userId) => {
    try {
      await unbanUser(userId);
      await fetchUsers(
        pagination.currentPage,
        searchQuery,
        selectedRole,
        selectedSort,
        verifiedFilter,
        bannedFilter,
        activeFilter
      );
      return true;
    } catch (err) {
      setError(err.message || 'Failed to unban user');
      return false;
    }
  };

  const banMultipleUsers = async (userIds) => {
    try {
      await bulkBanUsers(userIds);
      await fetchUsers(
        pagination.currentPage,
        searchQuery,
        selectedRole,
        selectedSort,
        verifiedFilter,
        bannedFilter,
        activeFilter
      );
      return true;
    } catch (err) {
      setError(err.message || 'Failed to ban users');
      return false;
    }
  };

  const unbanMultipleUsers = async (userIds) => {
    try {
      await bulkUnbanUsers(userIds);
      await fetchUsers(
        pagination.currentPage,
        searchQuery,
        selectedRole,
        selectedSort,
        verifiedFilter,
        bannedFilter,
        activeFilter
      );
      return true;
    } catch (err) {
      setError(err.message || 'Failed to unban users');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    selectedRole,
    selectedSort,
    searchQuery,
    handleSearch,
    verifiedFilter,
    bannedFilter,
    activeFilter,
    handleVerifiedChange,
    handleBannedChange,
    handleActiveChange,
    resetAllFilters,
    changeRole: handleRoleChange,
    changeSort: handleSortChange,
    changePage: handlePageChange,
    refetch: () =>
      fetchUsers(
        pagination.currentPage,
        searchQuery,
        selectedRole,
        selectedSort
      ),
    banSingleUser,
    unbanSingleUser,
    banMultipleUsers,
    unbanMultipleUsers,
  };
};

export default useUsers;

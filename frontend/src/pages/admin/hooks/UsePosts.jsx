// src/pages/admin/hooks/usePosts.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../../admin/api/adminApi';

const usePosts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam) : 1;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPosts = async (
    page = initialPage,
    query = '',
    type = '',
    sort = ''
  ) => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', 10); // Set a consistent limit
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    if (sort) params.set('sortBy', sort);

    setSearchParams(params);
    setLoading(true);
    setError(null);

    try {
      const response = await getAllPosts(
        page,
        sort,
        query,
        10, // limit
        type // pass type to backend
      );

      setPosts(response.posts || []);

      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          itemsPerPage: response.pagination.itemsPerPage,
        });
      }
    } catch (err) {
      setError(err || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const initialSearch = params.has('search') ? params.get('search') : '';
    const initialType = params.has('type') ? params.get('type') : '';
    const initialSort = params.has('sortBy') ? params.get('sortBy') : '';
    const initialPage = params.has('page') ? params.get('page') : 1;
    const initialStatus = params.has('status') ? params.get('status') : '';

    setSearchQuery(initialSearch);
    setSelectedType(initialType);
    setSelectedSort(initialSort);
    setStatusFilter(initialStatus);

    fetchPosts(
      initialPage,
      initialSearch,
      initialType,
      initialSort,
      initialStatus
    );
  }, []);

  const handleSearch = (query) => {
    const params = new URLSearchParams(window.location.search);
    params.set('search', query);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setPosts([]);
    setSearchQuery(query);
    fetchPosts(1, query, selectedType, selectedSort, statusFilter);
  };

  const handleTypeChange = (type) => {
    const params = new URLSearchParams(window.location.search);
    params.set('type', type);
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setPosts([]);
    setSelectedType(type);
    fetchPosts(1, searchQuery, type, selectedSort, statusFilter);
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(window.location.search);
    params.set('sortBy', sort);
    params.set('page', 1);
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setSelectedSort(sort);
    setPosts([]);
    fetchPosts(1, searchQuery, selectedType, sort, statusFilter);
  };

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(window.location.search);
    params.set('status', status);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setStatusFilter(status);
    fetchPosts(1, searchQuery, selectedType, selectedSort, status);
  };

  const handlePageChange = (page) => {
    fetchPosts(page, searchQuery, selectedType, selectedSort, statusFilter);
  };

  const resetAllFilters = () => {
    const cleanParams = new URLSearchParams();
    cleanParams.set('page', '1');

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${cleanParams}`
    );
    setSearchParams(cleanParams);

    setSearchQuery('');
    setSelectedType('');
    setSelectedSort('');
    setStatusFilter('');
    setPosts([]);
    fetchPosts(1, '', '', '', '');
  };

  return {
    posts,
    loading,
    error,
    pagination,
    selectedType,
    selectedSort,
    searchQuery,
    statusFilter,
    handleSearch,
    handleStatusChange,
    resetAllFilters,
    changeType: handleTypeChange,
    changeSort: handleSortChange,
    changePage: handlePageChange,
    refetch: () =>
      fetchPosts(
        pagination.currentPage,
        searchQuery,
        selectedType,
        selectedSort,
        statusFilter
      ),
  };
};

export default usePosts;

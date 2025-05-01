/* eslint-disable no-unused-vars */
// src/pages/admin/PostManagement/PostList.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import usePosts from '../hooks/usePosts';
import BulkActions from './BulkActions';
import StatusFilters from './StatusFilters';
import ActiveFilters from './ActiveFilters';
import PostFilters from './PostFilters';
import PostStats from './PostStats';
import PostTable from './PostTable';

const PostList = () => {
  const navigate = useNavigate();
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    posts,
    loading,
    error,
    pagination,
    searchQuery,
    selectedType,
    selectedSort,
    handleSearch,
    statusFilter,
    handleStatusChange,
    resetAllFilters,
    changeType,
    changeSort,
    changePage,
    // Add other post-specific actions here as needed
    refetch,
  } = usePosts();

  const handlePageChange = (page) => {
    changePage(page);
    window.scrollTo(0, 0);
  };

  const handleView = (postId) => navigate(`/admin/posts/${postId}`);

  // Add post-specific handlers as needed
  const handleSelectPost = (postId) => {
    if (!postId) return;
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedPosts(posts.map((post) => post._id));
    } else {
      setSelectedPosts([]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-[#008080] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-white">
            Post Management Dashboard
          </h2>
          <PostStats
            pagination={pagination}
            posts={posts}
            loading={loading}
            selectedType={selectedType}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
        <PostFilters
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedSort={selectedSort}
          handleSearch={handleSearch}
          changeType={changeType}
          changeSort={changeSort}
        />
      </div>

      {(selectedType || selectedSort || searchQuery || statusFilter) && (
        <ActiveFilters
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedSort={selectedSort}
          statusFilter={statusFilter}
          handleSearch={handleSearch}
          changeType={changeType}
          changeSort={changeSort}
          handleStatusChange={handleStatusChange}
          resetAllFilters={resetAllFilters}
        />
      )}

      {/* Bulk Actions - Add if needed */}
      {selectedPosts.length > 0 && (
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
          <BulkActions
            selectedCount={selectedPosts.length}
            isProcessing={isProcessing}
            // Add bulk action handlers as needed
          />
        </div>
      )}

      {/* Main Table */}
      <PostTable
        posts={posts}
        loading={loading || isProcessing}
        error={error}
        selectedPosts={selectedPosts}
        onSelectPost={handleSelectPost}
        onSelectAll={handleSelectAll}
        onView={handleView}
        isProcessing={isProcessing}
        pagination={pagination} // Make sure to pass this
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PostList;

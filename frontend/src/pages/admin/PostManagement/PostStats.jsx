/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/PostStats.js
import { Skeleton } from 'antd';

const PostStats = ({ pagination, posts, loading, selectedType }) => {
  if (loading) {
    return <Skeleton active paragraph={false} className="w-32" />;
  }

  const filteredCount = selectedType
    ? posts.filter((post) => post.postType === selectedType).length
    : posts.length;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-white">
        Showing <span className="font-bold">{filteredCount}</span> of{' '}
        <span className="font-bold">{pagination.totalItems}</span> posts
      </span>
    </div>
  );
};

export default PostStats;

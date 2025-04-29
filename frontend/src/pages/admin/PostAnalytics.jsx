/* eslint-disable no-unused-vars */
import { Spin } from 'antd';
import useDashboardPosts from './hooks/useDashboardPosts';
import ErrorDisplay from './common/ErrorDisplay';

const PostAnalytics = () => {
  const { posts, loading, error } = useDashboardPosts();

  return (
    <>
      <h2 className="text-xl font-semibold mb-6">Posts Analytics</h2>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div className="p-6">
          <ErrorDisplay message={error.message || 'Failed to load posts'} />
        </div>
      )}

      {/* Add your posts analytics components here */}
    </>
  );
};

export default PostAnalytics;

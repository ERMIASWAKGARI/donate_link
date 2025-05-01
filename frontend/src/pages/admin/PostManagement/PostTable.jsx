/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/PostTable.js
import { Checkbox, Spin } from 'antd';
import { formatDate } from '../../../utils/formatDate';

const PostTable = ({
  posts,
  loading,
  error,
  selectedPosts,
  onSelectPost,
  onSelectAll,
  onView,
  isProcessing,
}) => {
  if (error) {
    return (
      <div className="px-6 py-4 text-red-500">Error loading posts: {error}</div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="px-6 py-4 text-gray-500">
        No posts found matching your criteria
      </div>
    );
  }

  const allSelected = posts.length > 0 && selectedPosts.length === posts.length;

  return (
    <div className="w-full">
      {/* Responsive table container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  disabled={isProcessing}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                Organization/NGO
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedPosts.includes(post._id)}
                    onChange={() => onSelectPost(post._id)}
                    disabled={isProcessing}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {post.title}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.postType === 'donation'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {post.postType}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {post.postType === 'donation'
                      ? post.organization?.name || 'N/A'
                      : post.ngo?.name || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onView(post._id)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;

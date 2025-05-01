/* eslint-disable no-unused-vars */
import { Spin } from 'antd';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePostDetailHandlers } from '../hooks/usePostDetailHandlers';

const PostDetail = () => {
  const navigate = useNavigate();
  const {
    post,
    loading,
    error,
    formatDate,
    getPostStatus,
    getPostType,
    handleDeletePost,
  } = usePostDetailHandlers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  const postStatus = getPostStatus();
  const postType = getPostType();
  const isDonation = post.postType === 'donation';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-[#008080] px-6 py-4">
        <button
          onClick={() => navigate('/admin/posts')}
          className="mb-4 flex items-center text-white hover:text-gray-200 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Posts
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Title: {post.title}
            </h1>
          </div>
          <div className="mt-3 md:mt-0 flex space-x-2">
            <span className="px-3 py-1 rounded-md text-sm font-medium bg-yellow-400 text-green-900 min-w-[100px] text-center">
              {postType.text}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-6 space-y-6">
        {/* Basic Information and Creator Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-100">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
              <svg
                className="w-5 h-5 mr-2 text-[#008080]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Post ID:</span>
                <span className="font-medium text-gray-800">{post._id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Created Date:</span>
                <span className="font-medium text-gray-800">
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-800">
                  {formatDate(post.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium text-[#008080]`}>
                  {postStatus.text}
                </span>
              </div>
              {isDonation && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tracking ID:</span>
                  <span className="font-medium text-gray-800">
                    {post.trackingId || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Information Card */}
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-100">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
              <svg
                className="w-5 h-5 mr-2 text-[#008080]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">
                Creator Information
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-800">
                  {post.creator?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-800">
                  {post.creator?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-800">
                  {post.creator?.phone || 'N/A'}
                </span>
              </div>
              {isDonation && post.NGO && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Assigned NGO:</span>
                  <span className="font-medium text-gray-800">
                    {post.NGO?.name || 'Not assigned'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type-Specific Details Card */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <svg
              className="w-5 h-5 mr-2 text-[#008080]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">
              {isDonation ? 'Donation Details' : 'Need Details'}
            </h2>
          </div>
          <div className="space-y-6">
            {isDonation ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Donation Type
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {post.donationType}
                    </p>
                  </div>
                  {post.donationType === 'money' && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-gray-700 mb-3">
                        Amount
                      </h3>
                      <p className="text-gray-600">
                        {post.amount} {post.currency}
                      </p>
                    </div>
                  )}
                  {post.donationType === 'material' && (
                    <div className="bg-gray-50 p-4 rounded-md md:col-span-2">
                      <h3 className="text-md font-medium text-gray-700 mb-3">
                        Material Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Category:</span>{' '}
                            {post.materialDetails?.category}
                            {post.materialDetails?.customCategory &&
                              ` (${post.materialDetails.customCategory})`}
                          </p>
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Subcategory:</span>{' '}
                            {post.materialDetails?.subCategory}
                            {post.materialDetails?.customSubCategory &&
                              ` (${post.materialDetails.customSubCategory})`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Quantity:</span>{' '}
                            {post.materialDetails?.quantity}{' '}
                            {post.materialDetails?.unit}
                          </p>
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Condition:</span>{' '}
                            {post.materialDetails?.condition}
                          </p>
                          {post.materialDetails?.expirationDate && (
                            <p className="text-gray-600 mt-2">
                              <span className="font-medium">Expires:</span>{' '}
                              {formatDate(post.materialDetails.expirationDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {(post.address || post.location?.coordinates) && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Location
                    </h3>

                    {post.address && (
                      <p className="text-gray-600 mb-2">
                        {[
                          post.address.street,
                          post.address.city,
                          post.address.region,
                          post.address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}

                    {post.location?.coordinates && (
                      <a
                        href={`https://www.google.com/maps?q=${post.location.coordinates[1]},${post.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#008080] hover:underline transition-colors"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Need Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.needTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Urgency
                    </h3>
                    <p className="text-gray-600">{post.urgencyLevel}</p>
                  </div>
                  {post.targetMoney && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-gray-700 mb-3">
                        Target Amount
                      </h3>
                      <p className="text-gray-600">{post.targetMoney} ETB</p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      End Date
                    </h3>
                    <p className="text-gray-600">{formatDate(post.endDate)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Beneficiary Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">
                          Number of Beneficiaries:
                        </span>{' '}
                        {post.beneficiaryInfo?.numberOfBeneficiaries}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Location:</span>{' '}
                        {post.beneficiaryInfo?.location?.address}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-md font-medium text-gray-700 mb-3">
                        Images ({post.beneficiaryInfo.pictures.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {post.beneficiaryInfo.pictures.map((image, index) => (
                          <div
                            key={index}
                            className="rounded-md overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <img
                              src={`http://localhost:5000/uploads/${image.replace(
                                /\\/g,
                                '/'
                              )}`}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {post.categories && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">
                      Category Details
                    </h3>
                    {post.needTypes.includes('material') &&
                      post.categories.material && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700 mb-3">
                            Material Needs
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {post.categories.material.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white p-3 rounded-md border border-gray-200"
                              >
                                <p className="font-medium">
                                  Category: {item.categoryName}
                                </p>
                                <p className="mt-1">
                                  Subcategory: {item.subCategoryName}
                                </p>
                                <p className="mt-1">
                                  Amount Needed: {item.targetAmountNeeded}{' '}
                                  {item.unit}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {post.needTypes.includes('service') &&
                      post.categories.service && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700 mb-3">
                            Service Needs
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {post.categories.service.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white p-3 rounded-md border border-gray-200"
                              >
                                <p className="font-medium">
                                  Category: {item.categoryName}
                                </p>
                                <p className="mt-1">
                                  Subcategory: {item.subCategoryName}
                                </p>
                                <p className="mt-1">
                                  Vacancies: {item.vacancy}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Post Content Card */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <svg
              className="w-5 h-5 mr-2 text-[#008080]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">
              Post Content
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {post.description}
              </p>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  Images ({post.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-md overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={`http://localhost:5000/uploads/${image}`}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <svg
              className="w-5 h-5 mr-2 text-[#008080]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">
              Post Actions
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDeletePost}
              className="flex items-center text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-1.5 rounded-md text-sm font-medium transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

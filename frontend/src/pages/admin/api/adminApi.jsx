import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';
// const token = localStorage.getItem('accessToken');

const getAllUsers = async (
  page = 1,
  role = '',
  sort = '',
  query = '',
  verified = '',
  banned = '',
  active = '',
  all = false
) => {
  const token = localStorage.getItem('accessToken');

  // Build query parameters object
  const params = {
    page: page,
  };

  // Only add parameters if they have values
  if (role) params.role = role;
  if (sort) params.sortBy = sort;
  if (query) params.search = query;
  if (verified) params.verified = verified;
  if (banned) params.banned = banned;
  if (active) params.active = active;
  if (all) params.all = true; // Add the all parameter when needed

  const response = await axios.get(`${API_BASE_URL}/users`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    users: response.data.data.users,
    pagination: response.data.data.pagination,
  };
};
const getUserById = async (id) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data[0];
};

const verifyUser = async (id) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${id}/verify`,
      {}, // Empty body if not needed
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

const rejectUser = async (id, reason) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token
  console.log('Rejecting user with ID:', id, 'Reason:', reason); // Debugging line

  const response = await axios.patch(
    `${API_BASE_URL}/users/${id}/reject-verification`,
    { rejectionReason: reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log('Reject user response:', response);
  return response.data;
};

const banUser = async (id) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${id}/ban`,
      {}, // Empty body if not needed
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

const unbanUser = async (id) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${id}/unban`,
      {}, // Empty body if not needed
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

const bulkBanUsers = async (userIds) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/bulk-ban`,
      { userIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk banning users:', error);
    throw error;
  }
};

const bulkUnbanUsers = async (userIds) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/bulk-unban`,
      { userIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk unbanning users:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
  return response.data;
};
const getVerificationDocuments = async (userId) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/${userId}/verification-docs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Verification docs response:', response);
    return response.data.data; // Assuming your backend wraps data in a data property
  } catch (error) {
    console.error('Error fetching verification docs:', error.message);
    throw error;
  }
};

const getAllPosts = async (
  page = 1,
  sort = '',
  query = '',
  limit = 10,
  type = ''
) => {
  const token = localStorage.getItem('accessToken');

  const params = {
    page,
    limit,
    sortBy: sort,
    search: query,
    type,
  };

  try {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Posts response:', response.data);

    return {
      posts: response.data.data.posts,
      pagination: response.data.pagination,
      totalCount: response.data.count,
    };
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    throw error;
  }
};

const getAllDonations = async (page = 1, sort = '', limit = null) => {
  const token = localStorage.getItem('accessToken');

  const params = {
    page,
    sortBy: sort,
  };

  // Only include limit if specified
  if (limit) params.limit = limit;

  try {
    const response = await axios.get(`${API_BASE_URL}/donations`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      donations: response.data.data.donations,
      pagination: response.data.pagination,
      totalCount: response.data.count,
    };
  } catch (error) {
    console.error('Error fetching donations:', error.message);
    throw error;
  }
};

// Add to exports
export {
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  deleteUser,
  getAllUsers,
  getUserById,
  getVerificationDocuments,
  rejectUser,
  unbanUser,
  verifyUser,
  getAllPosts,
  getAllDonations,
};

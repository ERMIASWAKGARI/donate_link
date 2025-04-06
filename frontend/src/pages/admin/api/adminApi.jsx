import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';
const token = localStorage.getItem('accessToken');

const getAllUsers = async (page = 1, role = '', sort = '', query = '') => {
  // Build query parameters object
  const params = {
    page: page,
  };

  // Only add parameters if they have values
  if (role) params.role = role;
  if (sort) params.sortBy = sort;
  if (query) params.search = query;

  const response = await axios.get(`${API_BASE_URL}/users`, {
    params, // axios will properly encode the parameters
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
  const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('Response from getUserById:', response.data.data[0]); // Debugging line
  return response.data.data[0];
};

const verifyUser = async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/users/${id}`);
  return response.data;
};

const rejectUser = async (id, reason) => {
  const response = await axios.patch(
    `${API_BASE_URL}/users/${id}/reject-verification`,
    { rejectionReason: reason }
  );
  return response.data;
};

const banUser = async (id) => {
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

export {
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  deleteUser,
  getAllUsers,
  getUserById,
  rejectUser,
  unbanUser,
  verifyUser,
};

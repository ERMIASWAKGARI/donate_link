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
  const response = await axios.patch(`${API_BASE_URL}/users/${id}/ban`);
  return response.data;
};

const unbanUser = async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/users/${id}/unban`);
  return response.data;
};

const bulkBanUsers = async (userIds) => {
  const response = await axios.patch(`${API_BASE_URL}/users/bulk-ban`, {
    userIds,
  });
  return response.data;
};

const bulkUnbanUsers = async (userIds) => {
  const response = await axios.patch(`${API_BASE_URL}/users/bulk-unban`, {
    userIds,
  });
  return response.data;
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

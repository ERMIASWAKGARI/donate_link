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
  active = ''
) => {
  const token = localStorage.getItem('accessToken'); // Get fresh token

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
  console.log('Query parameters:', params); // Debugging line

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
  const token = localStorage.getItem('accessToken'); // Get fresh token

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

    console.log('Verification docs response:', response.data.data);
    return response.data.data; // Assuming your backend wraps data in a data property
  } catch (error) {
    console.error('Error fetching verification docs:', error);
    throw error;
  }
};
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
};

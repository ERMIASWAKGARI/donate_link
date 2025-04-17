// userSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

// Async thunk for fetching user details
export const fetchUserDetails = createAsyncThunk(
  'user/fetchDetails',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('User details response:', response);
      return response.data.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user details'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    loading: false,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      const token = action.payload;
      state.accessToken = token;
      localStorage.setItem('accessToken', token);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.accessToken = null;
        localStorage.removeItem('accessToken');
      });
  },
});

export const { login, logout, clearError } = userSlice.actions;
export default userSlice.reducer;

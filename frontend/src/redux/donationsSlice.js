// donationsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axiosConfig"; // Your API service

// Async thunk to fetch donation data for a need
export const fetchDonationsByNeed = createAsyncThunk(
  "donations/fetchByNeed",
  async (needId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`donation/amountDonated/${needId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const donationsSlice = createSlice({
  name: "donations",
  initialState: {
    byNeedId: {}, // Stores donation data keyed by need ID
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    // You can add manual updates if needed
    updateDonationData(state, action) {
      const { needId, data } = action.payload;
      state.byNeedId[needId] = data;
      state.lastUpdated = new Date().toISOString();
    },
    clearDonationData(state) {
      state.byNeedId = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonationsByNeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonationsByNeed.fulfilled, (state, action) => {
        state.loading = false;
        const { needId, donations } = action.payload;
        state.byNeedId[needId] = donations;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDonationsByNeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

// Selectors
export const selectDonationsByNeedId = (needId) => (state) =>
  state.donations.byNeedId[needId] || null;

export const selectDonationsLoading = (state) => state.donations.loading;
export const selectDonationsError = (state) => state.donations.error;
export const selectLastUpdated = (state) => state.donations.lastUpdated;

// Action creators
export const { updateDonationData, clearDonationData } = donationsSlice.actions;

export default donationsSlice.reducer;

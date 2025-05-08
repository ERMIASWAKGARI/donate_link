import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axiosConfig";

export const fetchDonationsByNeed = createAsyncThunk(
  "donations/fetchByNeed",
  async (needId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`donation/amountDonated/${needId}`);
      console.log("here is response", response);
      return { needId, donations: response.data.donations };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const donationsSlice = createSlice({
  name: "donations",
  initialState: {
    byNeedId: {},
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
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
        state.error = action.payload?.message || "Failed to fetch donations";
      });
  },
});

export const selectDonationsByNeedId = (needId) => (state) =>
  state?.donations?.byNeedId[needId] || null;

export const selectDonationsLoading = (state) => state.donations.loading;
export const selectDonationsError = (state) => state.donations.error;
export const selectLastUpdated = (state) => state.donations.lastUpdated;

export const { updateDonationData, clearDonationData } = donationsSlice.actions;

export default donationsSlice.reducer;

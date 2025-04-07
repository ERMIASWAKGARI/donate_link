import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../config/axiosConfig";

export const fetchFilteredNeeds = createAsyncThunk(
  "needs/fetchFiltered",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log("params", params);
      const {
        searchTerm = "",
        category = "all",
        page = 1,
        limit = 10,
      } = params;
      let url = `/donation/getAllNeeds?page=${page}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (category !== "all") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await axiosInstance.get(url);
      console.log("response", response.data);
      return response.data;
    } catch (err) {
      console.log("error", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch needs"
      );
    }
  }
);

const needSlice = createSlice({
  name: "needs",
  initialState: {
    needs: [],
    loading: false,
    error: null,
    filters: {
      searchTerm: "",
      category: "all",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetFilters: (state) => {
      state.filters = {
        searchTerm: "",
        category: "all",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredNeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredNeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.needs = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
        };
      })
      .addCase(fetchFilteredNeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.needs = [];
        state.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        };
      });
  },
});

export const { setFilters, resetFilters } = needSlice.actions;
export default needSlice.reducer;

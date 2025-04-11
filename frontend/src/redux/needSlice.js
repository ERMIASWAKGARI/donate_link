import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../config/axiosConfig";

export const fetchFilteredNeeds = createAsyncThunk(
  "needs/fetchFiltered",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const {
        searchTerm = "",
        category = "all",
        page = 1,
        limit = 10,
        disableLoading = false, // New parameter to control loading state
      } = params;
      
      let url = `/donation/getAllNeeds?page=${page}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (category !== "all") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await axiosInstance.get(url);
      return { 
        data: response.data,
        disableLoading // Pass this flag to the reducer
      };
    } catch (err) {
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredNeeds.pending, (state, action) => {
        // Only set loading to true if disableLoading is not true
        if (action.meta.arg?.searchTerm==="") {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchFilteredNeeds.fulfilled, (state, action) => {
        // Only set loading to false if it was true (not disabled)
        if (!action.meta.arg?.disableLoading) {
          state.loading = false;
        }
        state.needs = action.payload.data.data || [];
        state.pagination = {
          currentPage: action.payload.data.currentPage || 1,
          totalPages: action.payload.data.totalPages || 1,
          totalItems: action.payload.data.totalItems || 0,
        };
      })
      .addCase(fetchFilteredNeeds.rejected, (state, action) => {
        // Only set loading to false if it was true (not disabled)
        if (!action.meta.arg?.disableLoading) {
          state.loading = false;
        }
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

export const { setFilters, resetFilters, setLoading } = needSlice.actions;
export default needSlice.reducer;
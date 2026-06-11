import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchExpenditureAnalytics = createAsyncThunk(
  'analytics/fetchExpenditureAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/analytics', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenditure analytics'
      );
    }
  }
);

const initialState = {
  analyticsData: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalyticsState: (state) => {
      state.analyticsData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenditureAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenditureAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analyticsData = action.payload;
      })
      .addCase(fetchExpenditureAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalyticsError, resetAnalyticsState } = analyticsSlice.actions;

export default analyticsSlice.reducer;

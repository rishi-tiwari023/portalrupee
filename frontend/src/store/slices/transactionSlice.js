import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Search users by name, email, or mobile
export const searchUsers = createAsyncThunk(
  'transaction/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/search?query=${query}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

// Execute transfer
export const executeTransfer = createAsyncThunk(
  'transaction/executeTransfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions/transfer', transferData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

const initialState = {
  searchResults: [],
  loading: false,
  error: null,
  success: false,
  lastTransaction: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransactionState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.lastTransaction = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Execute Transfer
      .addCase(executeTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(executeTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastTransaction = action.payload.transaction;
      })
      .addCase(executeTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetTransactionState, clearSearchResults } = transactionSlice.actions;

export default transactionSlice.reducer;

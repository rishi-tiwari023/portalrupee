import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const deposit = createAsyncThunk(
  'transaction/deposit',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await API.post('/transactions/deposit', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Deposit failed. Please try again.'
      );
    }
  }
);

export const withdraw = createAsyncThunk(
  'transaction/withdraw',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await API.post('/transactions/withdraw', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Withdrawal failed. Please try again.'
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  'transaction/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await API.get(`/users/search?query=${query}`);
      return response.data.data.users;
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
      const response = await API.post('/transactions/transfer', transferData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

// Fetch transaction history
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get('/transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const initialState = {
  searchResults: [],
  history: [],
  pagination: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
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
    clearTransactionStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Deposit
      .addCase(deposit.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deposit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(deposit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Withdraw
      .addCase(withdraw.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(withdraw.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(withdraw.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        state.lastTransaction = action.payload.transaction || action.payload;
      })
      .addCase(executeTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetTransactionState,
  clearSearchResults,
  clearTransactionStatus
} = transactionSlice.actions;

export default transactionSlice.reducer;

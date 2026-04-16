import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all accounts for the logged-in user
export const fetchMyAccounts = createAsyncThunk(
  'account/fetchMyAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

// Fetch specific account details
export const fetchAccountDetails = createAsyncThunk(
  'account/fetchAccountDetails',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accounts/${accountId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account details');
    }
  }
);

// Get account balance
export const fetchAccountBalance = createAsyncThunk(
  'account/fetchAccountBalance',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accounts/${accountId}/balance`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

// Create a new account
export const createAccount = createAsyncThunk(
  'account/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create account');
    }
  }
);

const initialState = {
  accounts: [],
  currentAccount: null,
  loading: false,
  error: null,
  success: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    resetAccountStatus: (state) => {
      state.error = null;
      state.success = false;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Accounts
      .addCase(fetchMyAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchMyAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Account Details
      .addCase(fetchAccountDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.accounts.unshift(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetAccountStatus, clearCurrentAccount } = accountSlice.actions;

export default accountSlice.reducer;

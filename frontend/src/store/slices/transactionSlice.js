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

const initialState = {
  loading: false,
  error: null,
  success: false,
  lastTransaction: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
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
      });
  },
});

export const { clearTransactionStatus } = transactionSlice.actions;
export default transactionSlice.reducer;

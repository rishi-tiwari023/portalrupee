import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system stats');
    }
  }
);

export const fetchKycQueue = createAsyncThunk(
  'admin/fetchKycQueue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/kyc/queue');
      return response.data.data.queue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC queue');
    }
  }
);

export const updateKycStatus = createAsyncThunk(
  'admin/updateKycStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/users/${id}/kyc`, { status });
      return { id, status, user: response.data.data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update KYC status');
    }
  }
);

export const listUsers = createAsyncThunk(
  'admin/listUsers',
  async ({ page = 1, limit = 10, role, kycStatus, search } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (role) params.role = role;
      if (kycStatus) params.kycStatus = kycStatus;
      if (search) params.search = search;

      const response = await api.get('/admin/users', { params });
      return {
        users: response.data.data.users,
        total: response.data.total,
        page,
        limit
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users list');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return { userId, role, user: response.data.data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

const initialState = {
  stats: null,
  kycQueue: [],
  usersList: [],
  totalUsers: 0,
  currentPage: 1,
  limit: 10,
  loading: false,
  statsLoading: false,
  kycLoading: false,
  usersLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Fetch KYC Queue
      .addCase(fetchKycQueue.pending, (state) => {
        state.kycLoading = true;
        state.error = null;
      })
      .addCase(fetchKycQueue.fulfilled, (state, action) => {
        state.kycLoading = false;
        state.kycQueue = action.payload;
      })
      .addCase(fetchKycQueue.rejected, (state, action) => {
        state.kycLoading = false;
        state.error = action.payload;
      })

      // Update KYC Status
      .addCase(updateKycStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, user } = action.payload;
        // Remove from queue
        state.kycQueue = state.kycQueue.filter((item) => item._id !== id);
        // Update in directory list
        state.usersList = state.usersList.map((item) =>
          item._id === id ? { ...item, kycStatus: user.kycStatus } : item
        );
        // Update stats kyc count inline if stats exist
        if (state.stats) {
          const oldKycStatus = user.kycStatus === 'VERIFIED' || user.kycStatus === 'REJECTED' ? 'PENDING' : 'NOT_STARTED';
          if (state.stats.users.byKycStatus[oldKycStatus] > 0) {
            state.stats.users.byKycStatus[oldKycStatus]--;
          }
          if (user.kycStatus in state.stats.users.byKycStatus) {
            state.stats.users.byKycStatus[user.kycStatus]++;
          }
        }
      })
      .addCase(updateKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // List Users
      .addCase(listUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.usersList = action.payload.users;
        state.totalUsers = action.payload.total;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, role } = action.payload;
        // Update in directory list
        state.usersList = state.usersList.map((item) =>
          item._id === userId ? { ...item, role } : item
        );
        // Update stats role count inline if stats exist
        if (state.stats) {
          const oldUser = state.usersList.find((item) => item._id === userId);
          const oldRole = oldUser ? oldUser.role : 'CUSTOMER';
          if (state.stats.users.byRole[oldRole] > 0) {
            state.stats.users.byRole[oldRole]--;
          }
          if (role in state.stats.users.byRole) {
            state.stats.users.byRole[role]++;
          }
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const token = localStorage.getItem('portalrupee_token');

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  loading: !!token,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-2fa', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '2FA Verification failed');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ email, purpose }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp', { email, purpose });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp, purpose }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, purpose });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);

export const get2FASetup = createAsyncThunk(
  'auth/get2FASetup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/2fa/setup');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get 2FA setup');
    }
  }
);

export const enable2FA = createAsyncThunk(
  'auth/enable2FA',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post('/2fa/enable', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enable 2FA');
    }
  }
);

export const disable2FA = createAsyncThunk(
  'auth/disable2FA',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post('/2fa/disable', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable 2FA');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/profile', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const setTPIN = createAsyncThunk(
  'auth/setTPIN',
  async (tpin, { rejectWithValue }) => {
    try {
      const response = await api.post('/tpin/set', { tpin });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set TPIN');
    }
  }
);

export const changeTPIN = createAsyncThunk(
  'auth/changeTPIN',
  async ({ oldTPIN, newTPIN }, { rejectWithValue }) => {
    try {
      const response = await api.put('/tpin/change', { oldTPIN, newTPIN });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change TPIN');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('portalrupee_token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('portalrupee_token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.accessToken;
        localStorage.setItem('portalrupee_token', action.payload.data.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data.requires2FA) {
          // Handled by component to show 2FA input
          return;
        }
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.accessToken;
        localStorage.setItem('portalrupee_token', action.payload.data.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify 2FA
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.accessToken;
        localStorage.setItem('portalrupee_token', action.payload.data.accessToken);
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enable/Disable 2FA Fullfilled
      .addCase(enable2FA.fulfilled, (state, action) => {
        state.user.twoFactorEnabled = true;
      })
      .addCase(disable2FA.fulfilled, (state, action) => {
        state.user.twoFactorEnabled = false;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user || action.payload.data;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('portalrupee_token');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.data;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // setTPIN
      .addCase(setTPIN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setTPIN.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setTPIN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // changeTPIN
      .addCase(changeTPIN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeTPIN.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeTPIN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

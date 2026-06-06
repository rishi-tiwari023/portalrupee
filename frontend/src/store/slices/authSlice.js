import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // loading true initially to allow getMe to run
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

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
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

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
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

export const disable2FAViaOTP = createAsyncThunk(
  'auth/disable2FAViaOTP',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/disable-2fa-login', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable 2FA via OTP');
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

export const resetTPIN = createAsyncThunk(
  'auth/resetTPIN',
  async (tpin, { rejectWithValue }) => {
    try {
      const response = await api.post('/tpin/reset', { tpin });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset TPIN');
    }
  }
);


export const submitKYC = createAsyncThunk(
  'auth/submitKYC',
  async ({ idDocKey, sigDocKey }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/kyc', { idDocKey, sigDocKey });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC');
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
      
      
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      
      state.isAuthenticated = false;
      
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
      // Disable 2FA via OTP
      .addCase(disable2FAViaOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disable2FAViaOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        
        
      })
      .addCase(disable2FAViaOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
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
      })
      // resetTPIN
      .addCase(resetTPIN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetTPIN.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetTPIN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // submitKYC
      .addCase(submitKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || action.payload.data;
        state.error = null;
      })
      .addCase(submitKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

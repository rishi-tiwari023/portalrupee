import User from '../models/user.model.js';
import Account from '../models/account.model.js';
import AppError from '../utils/AppError.js';

const attachFreezeStatus = async (user) => {
  const accounts = await Account.find({ user: user._id });
  let isCompletelyFrozen = false;
  let isPartiallyFrozen = false;
  
  if (accounts.length > 0) {
    const blockedCount = accounts.filter(acc => acc.status === 'BLOCKED').length;
    if (blockedCount === accounts.length) {
      isCompletelyFrozen = true;
    } else if (blockedCount > 0) {
      isPartiallyFrozen = true;
    }
  }
  
  return { ...user.toObject(), isCompletelyFrozen, isPartiallyFrozen, accounts };
};
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';
import { generateOTP, storeOTP, verifyOTP as verifyOTPUtil, isOTPVerified, clearOTPVerification } from '../utils/otp.util.js';
import { enqueueEmail } from '../utils/queue.js';

const cookieOptions = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return next(new AppError('User with this email or mobile already exists', 400));
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      password,
      role,
      lastLogin: new Date(),
    });

    // Remove password from output
    user.password = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('jwt', accessToken, cookieOptions);

    // Queue welcome email
    await enqueueEmail({
      type: 'welcome',
      email,
      name: firstName,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from output
    user.password = undefined;

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication required',
        data: {
          requires2FA: true,
          email: user.email,
        },
      });
    }

    // Update lastLogin
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    const userWithStatus = await attachFreezeStatus(user);

    res.cookie('jwt', accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userWithStatus,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA during login
 */
export const verify2FA = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return next(new AppError('Email and OTP token are required', 400));
    }

    const user = await User.findOne({ email }).select('+twoFactorSecret');

    if (!user || !user.twoFactorEnabled) {
      return next(new AppError('User not found or 2FA not enabled', 400));
    }

    const secret = decrypt(user.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return next(new AppError('Invalid OTP token', 401));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update lastLogin
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    const userWithStatus = await attachFreezeStatus(user);

    res.cookie('jwt', accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userWithStatus,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'general' } = req.body;

    if (!email) {
      return next(new AppError('Email address is required', 400));
    }

    if (purpose === 'password_reset' || purpose === 'tpin_reset' || purpose === 'disable_2fa') {
      const user = await User.findOne({ email });
      if (!user) {
        return next(new AppError('No user found with this email address', 404));
      }
    }

    const otp = generateOTP();
    await storeOTP(email, otp, purpose);

    await enqueueEmail({
      type: 'otp',
      email,
      otp,
      purpose,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose = 'general' } = req.body;

    if (!email || !otp) {
      return next(new AppError('Email and OTP are required', 400));
    }

    const isValid = await verifyOTPUtil(email, otp, purpose);

    if (!isValid) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password (verified by OTP)
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if OTP was verified for this email and purpose 'password_reset'
    const isVerified = await isOTPVerified(email, 'password_reset');
    if (!isVerified) {
      return next(new AppError('Please verify your email via OTP first', 400));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update password
    user.password = password;
    await user.save();

    // Clear verification flag from Redis
    await clearOTPVerification(email, 'password_reset');

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA via OTP during login
 */
export const disable2FALogin = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if OTP was verified for this email and purpose 'disable_2fa'
    const isVerified = await isOTPVerified(email, 'disable_2fa');
    if (!isVerified) {
      return next(new AppError('Please verify your email via OTP first', 400));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Clear verification flag from Redis
    await clearOTPVerification(email, 'disable_2fa');

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Remove password from output
    user.password = undefined;

    const userWithStatus = await attachFreezeStatus(user);

    res.cookie('jwt', accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: '2FA disabled and logged in successfully',
      data: {
        user: userWithStatus,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};


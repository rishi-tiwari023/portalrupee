import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';

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
    });

    // Remove password from output
    user.password = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
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

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
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

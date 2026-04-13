import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';

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

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware to protect routes - Verify JWT
 */
export const isAuth = async (req, res, next) => {
  try {
    let token;

    // 1) Get token from headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Backfill tpinSet if tpin exists but tpinSet is false
    if (!user.tpinSet) {
      const userWithTpin = await User.findById(user._id).select('+tpin');
      if (userWithTpin.tpin) {
        user.tpinSet = true;
        await User.updateOne({ _id: user._id }, { tpinSet: true });
      }
    }

    // 4) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Middleware to verify TPIN for transactions
 */
export const verifyTPIN = async (req, res, next) => {
  try {
    const { tpin } = req.body;

    if (!tpin) {
      return next(new AppError('Please provide TPIN for this transaction', 400));
    }

    const user = await User.findById(req.user.id).select('+tpin');

    if (!user.tpin) {
      return next(new AppError('TPIN not set. Please set your TPIN first.', 400));
    }

    const isCorrect = await user.compareTPIN(tpin, user.tpin);
    if (!isCorrect) {
      return next(new AppError('Incorrect TPIN', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access based on roles
 * @param {...String} roles Allowed roles
 */
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by isAuth middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;

    // Filter out restricted fields (like password, role)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, mobile },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users by email or mobile (for transfers)
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { mobile: { $regex: query } },
      ],
      _id: { $ne: req.user.id }, // Exclude self from search
    }).select('firstName lastName email mobile');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

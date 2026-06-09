import User from '../models/user.model.js';
import Account from '../models/account.model.js';
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

    if (!query) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { users: [] },
      });
    }

    // 1. Search for accounts matching the query (for account number search)
    const matchingAccounts = await Account.find({
      accountNumber: { $regex: query, $options: 'i' },
    }).select('user');

    const userIdsFromAccounts = matchingAccounts.map((acc) => acc.user);

    // 2. Search users by name, email, mobile, or IDs found from account search
    const users = await User.find({
      $and: [
        {
          $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { mobile: { $regex: query, $options: 'i' } },
            { _id: { $in: userIdsFromAccounts } },
          ],
        },
        { _id: { $ne: req.user.id } }, // Exclude self
      ],
    }).select('firstName lastName email mobile role');

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

/**
 * Submit KYC documents
 */
export const submitKYC = async (req, res, next) => {
  try {
    const { idDocKey, sigDocKey } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        kycDocumentKey: idDocKey,
        kycSignatureKey: sigDocKey,
        kycStatus: 'PENDING',
      },
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
      message: 'KYC documents submitted successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

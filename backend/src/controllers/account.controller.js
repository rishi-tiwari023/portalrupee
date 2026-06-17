import Account from '../models/account.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';

const generateAccountNumber = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export const createAccount = async (req, res, next) => {
  try {
    const { accountType } = req.body;
    const userId = req.user.id;

    const existingAccount = await Account.findOne({ user: userId, accountType });
    if (existingAccount) {
      return next(new AppError(`You already have a ${accountType} account`, 400));
    }

    let accountNumber;
    let isUnique = false;

    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const existingDbAccount = await Account.findOne({ accountNumber });
      if (!existingDbAccount) {
        isUnique = true;
      }
    }

    const newAccount = await Account.create({
      user: userId,
      accountNumber,
      accountType,
      balance: 0,
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      data: newAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id })
      .populate('user', 'firstName lastName email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountDetails = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('user', 'firstName lastName email mobile');

    if (!account) {
      return next(new AppError('Account not found or unauthorized', 404));
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountByNumber = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;

    // Check if user is looking for their own account or is a manager
    const account = await Account.findOne({ accountNumber })
      .populate('user', 'firstName lastName email mobile');

    if (!account) {
      return next(new AppError('Account not found', 404));
    }

    // Role-based access check
    if (req.user.role !== 'MANAGER' && req.user.id !== account.user._id.toString()) {
      return next(new AppError('You are not authorized to view this account info', 403));
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAccounts = async (req, res, next) => {
  try {
    // Only Managers can access this
    if (req.user.role !== 'MANAGER') {
      return next(new AppError('Unauthorized access', 403));
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const accounts = await Account.find()
      .populate('user', 'firstName lastName email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Account.countDocuments();

    res.status(200).json({
      success: true,
      results: accounts.length,
      total,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    
    if (user.twoFactorEnabled) {
      const { totpToken } = req.body;
      
      if (!totpToken) {
        return next(new AppError('2FA is enabled. TOTP token is required.', 403));
      }

      const secret = decrypt(user.twoFactorSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: totpToken,
        window: 1,
      });

      if (!verified) {
        return next(new AppError('Invalid TOTP token', 403));
      }
    }

    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).select('balance');

    if (!account) {
      return next(new AppError('Account not found or unauthorized', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        balance: account.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccountStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const account = await Account.findById(req.params.id);

    if (!account) {
      return next(new AppError('Account not found', 404));
    }

    // New logic: Prevent closing account if balance is not zero
    if (status === 'CLOSED' && account.balance > 0) {
      return next(new AppError('Account cannot be closed while balance is greater than zero', 400));
    }

    account.status = status;
    await account.save();

    res.status(200).json({
      success: true,
      message: `Account status updated to ${status}`,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const freezeAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return next(new AppError('Account not found', 404));
    }

    account.status = 'BLOCKED';
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account frozen successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const unfreezeAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return next(new AppError('Account not found', 404));
    }

    account.status = 'ACTIVE';
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account unfrozen successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};


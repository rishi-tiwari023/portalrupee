import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';
import { runInTransaction } from '../utils/transaction.util.js';

/**
 * @desc    Deposit money to an account
 * @route   POST /api/v1/transactions/deposit
 * @access  Private
 */
export const deposit = async (req, res, next) => {
  try {
    const { accountNumber, amount, description, totpToken } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (user.twoFactorEnabled) {
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

    const result = await runInTransaction(async (session) => {
      const account = await Account.findOne({ accountNumber }).session(session);
      if (!account) {
        throw new AppError('Account not found', 404);
      }

      if (account.status !== 'ACTIVE') {
        throw new AppError('Account is not active', 400);
      }

      const [transaction] = await Transaction.create(
        [
          {
            receiverAccount: account._id,
            amount,
            type: 'DEPOSIT',
            status: 'SUCCESS',
            description: description || 'Deposit to account',
          },
        ],
        { session }
      );

      account.balance += amount;
      await account.save({ session });

      return {
        transaction,
        newBalance: account.balance,
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Deposit successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw money from an account
 * @route   POST /api/v1/transactions/withdraw
 * @access  Private
 */
export const withdraw = async (req, res, next) => {
  try {
    const { accountNumber, amount, description, totpToken } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (user.twoFactorEnabled) {
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

    const result = await runInTransaction(async (session) => {
      const account = await Account.findOne({ accountNumber }).session(session);
      if (!account) {
        throw new AppError('Account not found', 404);
      }

      if (req.user.role !== 'MANAGER' && account.user.toString() !== req.user.id) {
        throw new AppError('You are not authorized to withdraw from this account', 403);
      }

      if (account.status !== 'ACTIVE') {
        throw new AppError('Account is not active', 400);
      }

      if (account.balance < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      const [transaction] = await Transaction.create(
        [
          {
            senderAccount: account._id,
            amount,
            type: 'WITHDRAW',
            status: 'SUCCESS',
            description: description || 'Withdrawal from account',
          },
        ],
        { session }
      );

      account.balance -= amount;
      await account.save({ session });

      return {
        transaction,
        newBalance: account.balance,
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Transfer money from current user to another user
 * @route   POST /api/v1/transactions/transfer
 * @access  Private (TPIN Verified)
 */
export const transferMoney = async (req, res, next) => {
  try {
    const { receiverId, amount, description, totpToken, senderAccountId } = req.body;
    const senderId = req.user.id;

    // 1. Initial Checks (outside transaction for speed/validation)
    const user = await User.findById(senderId).select('+twoFactorSecret');
    if (user.twoFactorEnabled) {
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

    // 2. Run Database Operations in Transaction with Retry Logic
    const result = await runInTransaction(async (session) => {
      // Find sender account
      const senderQuery = senderAccountId 
        ? { _id: senderAccountId, user: senderId, status: 'ACTIVE' }
        : { user: senderId, status: 'ACTIVE' };
      
      const senderAccount = await Account.findOne(senderQuery).session(session);
      if (!senderAccount) {
        throw new AppError('Sender active account not found', 404);
      }

      if (senderAccount.balance < amount) {
        throw new AppError('Insufficient balance for this transfer', 400);
      }

      // Find receiver account (default to their first active account)
      const receiverAccount = await Account.findOne({ user: receiverId, status: 'ACTIVE' }).session(session);
      if (!receiverAccount) {
        throw new AppError('Receiver active account not found or account is not active', 404);
      }

      // Create transaction record
      const [transaction] = await Transaction.create(
        [
          {
            sender: senderId,
            receiver: receiverId,
            senderAccount: senderAccount._id,
            receiverAccount: receiverAccount._id,
            amount,
            type: 'TRANSFER',
            description: description || `Transfer to ${receiverId}`,
            status: 'SUCCESS',
          },
        ],
        { session }
      );

      // Update balances
      senderAccount.balance -= amount;
      await senderAccount.save({ session });

      receiverAccount.balance += amount;
      await receiverAccount.save({ session });

      return {
        transaction,
        newBalance: senderAccount.balance
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Transfer successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction history with filters and pagination
 * @route   GET /api/v1/transactions
 * @access  Private
 */
export const getTransactionHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      userId,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Role-based scoping
    if (req.user.role === 'CUSTOMER') {
      query.$or = [
        { sender: req.user.id },
        { receiver: req.user.id },
      ];

      const userAccounts = await Account.find({ user: req.user.id }).select('_id');
      const accountIds = userAccounts.map(acc => acc._id);

      query.$or = [
        { sender: req.user.id },
        { receiver: req.user.id },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ];
    } else if (userId) {
      const targetUserAccounts = await Account.find({ user: userId }).select('_id');
      const accountIds = targetUserAccounts.map(acc => acc._id);

      query.$or = [
        { sender: userId },
        { receiver: userId },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ];
    }

    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = minAmount;
      if (maxAmount !== undefined) query.amount.$lte = maxAmount;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { transactionId: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const totalTransactions = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'firstName lastName email')
      .populate('receiver', 'firstName lastName email')
      .populate('senderAccount', 'accountNumber type')
      .populate('receiverAccount', 'accountNumber type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      pagination: {
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limit),
        page: Number(page),
        limit: Number(limit),
      },
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';

/**
 * @desc    Deposit money to an account
 * @route   POST /api/v1/transactions/deposit
 * @access  Private
 */
export const deposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { accountNumber, amount, description, totpToken } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (user.twoFactorEnabled) {
      if (!totpToken) {
        await session.abortTransaction();
        session.endSession();
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
        await session.abortTransaction();
        session.endSession();
        return next(new AppError('Invalid TOTP token', 403));
      }
    }

    // Find the account
    const account = await Account.findOne({ accountNumber }).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Account not found', 404));
    }

    if (account.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Account is not active', 400));
    }

    // Create a pending transaction record first
    const transactionArray = await Transaction.create(
      [
        {
          receiverAccount: account._id,
          amount,
          type: 'DEPOSIT',
          status: 'PENDING',
          description: description || 'Deposit to account',
        },
      ],
      { session }
    );

    const transaction = transactionArray[0];

    // Update account balance
    account.balance += amount;
    await account.save({ session });

    // Mark transaction as success
    transaction.status = 'SUCCESS';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Deposit successful',
      data: {
        transaction,
        newBalance: account.balance,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

/**
 * @desc    Withdraw money from an account
 * @route   POST /api/v1/transactions/withdraw
 * @access  Private
 */
export const withdraw = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { accountNumber, amount, description, totpToken } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (user.twoFactorEnabled) {
      if (!totpToken) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError('2FA is enabled. TOTP token is required.', 401));
      }

      const secret = decrypt(user.twoFactorSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: totpToken,
        window: 1,
      });

      if (!verified) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError('Invalid TOTP token', 401));
      }
    }

    // Find the account
    const account = await Account.findOne({ accountNumber }).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Account not found', 404));
    }

    // Check if user owns the account (unless manager)
    if (req.user.role !== 'MANAGER' && account.user.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('You are not authorized to withdraw from this account', 403));
    }

    if (account.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Account is not active', 400));
    }

    if (account.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Insufficient balance', 400));
    }

    // Create a pending transaction record
    const transactionArray = await Transaction.create(
      [
        {
          senderAccount: account._id,
          amount,
          type: 'WITHDRAW',
          status: 'PENDING',
          description: description || 'Withdrawal from account',
        },
      ],
      { session }
    );

    const transaction = transactionArray[0];

    // Update account balance
    account.balance -= amount;
    await account.save({ session });

    // Mark transaction as success
    transaction.status = 'SUCCESS';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        transaction,
        newBalance: account.balance,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

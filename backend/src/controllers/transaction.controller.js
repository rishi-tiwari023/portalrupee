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

    const account = await Account.findOne({ accountNumber }).session(session);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    if (account.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 400);
    }

    const transactionArray = await Transaction.create(
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

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Deposit successful',
      data: {
        transaction: transactionArray[0],
        newBalance: account.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
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

    const transactionArray = await Transaction.create(
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

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal successful',
      data: {
        transaction: transactionArray[0],
        newBalance: account.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * @desc    Transfer money from current user to another user
 * @route   POST /api/v1/transactions/transfer
 * @access  Private (TPIN Verified)
 */
export const transferMoney = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverId, amount, description } = req.body;
    const senderId = req.user.id;

    const senderAccount = await Account.findOne({ user: senderId, status: 'ACTIVE' }).session(session);
    if (!senderAccount) {
      throw new AppError('Sender active account not found', 404);
    }

    if (senderAccount.balance < amount) {
      throw new AppError('Insufficient balance for this transfer', 400);
    }

    const receiverAccount = await Account.findOne({ user: receiverId, status: 'ACTIVE' }).session(session);
    if (!receiverAccount) {
      throw new AppError('Receiver active account not found or account is not active', 404);
    }

    const transactionArray = await Transaction.create(
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

    senderAccount.balance -= amount;
    await senderAccount.save({ session });

    receiverAccount.balance += amount;
    await receiverAccount.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Transfer successful',
      data: {
        transaction: transactionArray[0],
        newBalance: senderAccount.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

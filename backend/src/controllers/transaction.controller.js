import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../utils/encryption.util.js';
import { runInTransaction } from '../utils/transaction.util.js';
import { enqueueTransactionAlert } from '../utils/queue.js';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        userId: account.user,
      };
    });

    // Queue real-time transaction notification
    await enqueueTransactionAlert({
      userId: result.userId.toString(),
      transactionId: result.transaction.transactionId,
      type: 'DEPOSIT',
      amount,
      message: `Your account has been credited with ₹${amount} via Deposit.`,
      createdAt: result.transaction.createdAt,
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
        userId: account.user,
      };
    });

    // Queue real-time transaction notification
    await enqueueTransactionAlert({
      userId: result.userId.toString(),
      transactionId: result.transaction.transactionId,
      type: 'WITHDRAW',
      amount,
      message: `Your account has been debited with ₹${amount} via Withdrawal.`,
      createdAt: result.transaction.createdAt,
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

    // Queue real-time transaction notifications
    const receiver = await User.findById(receiverId).select('firstName lastName');
    const receiverName = receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Recipient';
    const senderName = `${req.user.firstName} ${req.user.lastName}`;

    await enqueueTransactionAlert({
      userId: senderId.toString(),
      transactionId: result.transaction.transactionId,
      type: 'TRANSFER',
      subType: 'SENT',
      amount,
      message: `Successfully transferred ₹${amount} to ${receiverName}.`,
      createdAt: result.transaction.createdAt,
    });

    await enqueueTransactionAlert({
      userId: receiverId.toString(),
      transactionId: result.transaction.transactionId,
      type: 'TRANSFER',
      subType: 'RECEIVED',
      amount,
      message: `You received ₹${amount} from ${senderName}.`,
      createdAt: result.transaction.createdAt,
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

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);
    const skip = (pageNum - 1) * limitNum;

    // Role-based scoping
    let baseQuery = {};
    if (req.user.role === 'CUSTOMER') {
      const userAccounts = await Account.find({ user: req.user.id }).select('_id');
      const accountIds = userAccounts.map(acc => acc._id);

      baseQuery.$or = [
        { sender: req.user.id },
        { receiver: req.user.id },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ];
    } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const targetUserAccounts = await Account.find({ user: userId }).select('_id');
      const accountIds = targetUserAccounts.map(acc => acc._id);

      baseQuery.$or = [
        { sender: userId },
        { receiver: userId },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ];
    }

    const query = { ...baseQuery };
    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
      const dateQuery = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) dateQuery.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          dateQuery.$lte = end;
        }
      }
      if (Object.keys(dateQuery).length > 0) query.createdAt = dateQuery;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      const amountQuery = {};
      if (minAmount !== undefined && minAmount !== '') amountQuery.$gte = Number(minAmount);
      if (maxAmount !== undefined && maxAmount !== '') amountQuery.$lte = Number(maxAmount);
      if (Object.keys(amountQuery).length > 0) query.amount = amountQuery;
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
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      pagination: {
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limitNum) || 0,
        page: pageNum,
        limit: limitNum,
      },
      data: {
        transactions,
      },
    });
  } catch (error) {
    console.error('Transaction History Error:', error);
    next(error);
  }
};

/**
 * @desc    Generate PDF statement for an account
 * @route   GET /api/v1/transactions/statement
 * @access  Private
 */
export const generateStatement = async (req, res, next) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    // Role-based scoping
    let accountQuery = { status: 'ACTIVE' };
    
    if (accountId) {
      accountQuery._id = accountId;
    }

    if (req.user.role === 'CUSTOMER') {
      accountQuery.user = req.user.id;
    }

    const account = await Account.findOne(accountQuery).populate('user', 'firstName lastName email mobile');

    if (!account) {
      return next(new AppError('Account not found or unauthorized', 404));
    }

    const query = {
      $or: [
        { senderAccount: account._id },
        { receiverAccount: account._id }
      ],
      createdAt: { $gte: start, $lte: end }
    };

    const transactions = await Transaction.find(query)
      .populate('senderAccount', 'accountNumber type')
      .populate('receiverAccount', 'accountNumber type')
      .sort({ createdAt: 1 }); // Chronological order for statement

    const formattedTransactions = transactions.map(txn => {
      const isCredit = txn.receiverAccount && txn.receiverAccount._id.toString() === account._id.toString();
      return {
        date: new Date(txn.createdAt).toLocaleString(),
        id: txn.transactionId,
        description: txn.description || txn.type,
        type: isCredit ? 'CREDIT' : 'DEBIT',
        amount: txn.amount,
        isCredit
      };
    });

    const templatePath = path.join(__dirname, '../templates/statement.ejs');
    
    const html = await ejs.renderFile(templatePath, {
      user: account.user,
      account,
      startDate: start.toLocaleDateString(),
      endDate: end.toLocaleDateString(),
      transactions: formattedTransactions
    });

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const buffer = Buffer.from(pdfBuffer);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=statement-${account.accountNumber}.pdf`,
      'Content-Length': buffer.length
    });

    res.send(buffer);
  } catch (error) {
    console.error('Generate Statement Error:', error);
    next(error);
  }
};

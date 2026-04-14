import Account from '../models/account.model.js';
import AppError from '../utils/AppError.js';

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
    const accounts = await Account.find({ user: req.user.id }).sort({ createdAt: -1 });

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
    });

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

export const getAccountBalance = async (req, res, next) => {
  try {
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

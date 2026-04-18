import Account from '../models/account.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const accounts = await Account.find({ user: userId });

    let totalBalance = 0;
    accounts.forEach(acc => {
      totalBalance += acc.balance;
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalBalance,
        accountCount: accounts.length,
        accounts,
        recentActivity: []
      }
    });
  } catch (error) {
    next(error);
  }
};

import Account from '../models/account.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import AppError from '../utils/AppError.js';

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const accounts = await Account.find({ user: userId });
    const accountIds = accounts.map(acc => acc._id);

    const recentActivity = await Transaction.find({
      $or: [
        { sender: userId },
        { receiver: userId },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName');

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
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

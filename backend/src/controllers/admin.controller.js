import User from '../models/user.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import AuditLog from '../models/auditLog.model.js';
import AppError from '../utils/AppError.js';
import { getPresignedUrlForViewing } from '../utils/s3.helper.js';

/**
 * Update user role (Managers only)
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive system statistics (Managers only)
 */
export const getSystemStats = async (req, res, next) => {
  try {
    // 1. User stats
    const totalUsers = await User.countDocuments();
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const byRole = { CUSTOMER: 0, CASHIER: 0, MANAGER: 0 };
    roleStats.forEach(r => {
      if (r._id in byRole) byRole[r._id] = r.count;
    });

    const kycStats = await User.aggregate([
      { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
    ]);
    const byKycStatus = { NOT_STARTED: 0, PENDING: 0, VERIFIED: 0, REJECTED: 0 };
    kycStats.forEach(k => {
      if (k._id in byKycStatus) byKycStatus[k._id] = k.count;
    });

    // 2. Account stats
    const totalAccounts = await Account.countDocuments();
    const balanceStats = await Account.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalBalance = balanceStats.length > 0 ? balanceStats[0].totalBalance : 0;

    // 3. Transaction stats
    const totalTransactions = await Transaction.countDocuments();
    const volumeStats = await Transaction.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, totalVolume: { $sum: '$amount' } } }
    ]);
    const totalVolume = volumeStats.length > 0 ? volumeStats[0].totalVolume : 0;

    const typeStats = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, volume: { $sum: '$amount' } } }
    ]);
    const byType = {
      DEPOSIT: { count: 0, volume: 0 },
      WITHDRAW: { count: 0, volume: 0 },
      TRANSFER: { count: 0, volume: 0 }
    };
    typeStats.forEach(t => {
      if (t._id in byType) {
        byType[t._id] = { count: t.count, volume: t.volume };
      }
    });

    const statusStats = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = { SUCCESS: 0, PENDING: 0, FAILED: 0 };
    statusStats.forEach(s => {
      if (s._id in byStatus) byStatus[s._id] = s.count;
    });

    // 4. Recent activities
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sender', 'firstName lastName email mobile')
      .populate('receiver', 'firstName lastName email mobile')
      .populate('senderAccount', 'accountNumber')
      .populate('receiverAccount', 'accountNumber');

    const recentAuditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('actor', 'firstName lastName email mobile');

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          byRole,
          byKycStatus
        },
        accounts: {
          total: totalAccounts,
          totalBalance
        },
        transactions: {
          totalCount: totalTransactions,
          totalVolume,
          byType,
          byStatus
        },
        recentTransactions,
        recentAuditLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC pending approval queue (Managers only)
 */
export const getKycQueue = async (req, res, next) => {
  try {
    const queue = await User.find({ kycStatus: 'PENDING' })
      .sort({ updatedAt: 1 }); // FIFO - oldest first

    const queueWithUrls = await Promise.all(
      queue.map(async (user) => {
        const userObj = user.toObject();
        if (userObj.kycDocumentKey) {
          userObj.kycDocumentUrl = await getPresignedUrlForViewing(userObj.kycDocumentKey);
        }
        if (userObj.kycSignatureKey) {
          userObj.kycSignatureUrl = await getPresignedUrlForViewing(userObj.kycSignatureKey);
        }
        return userObj;
      })
    );

    res.status(200).json({
      status: 'success',
      results: queueWithUrls.length,
      data: {
        queue: queueWithUrls
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject KYC status (Managers only)
 */
export const updateKycStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.kycStatus = status;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `KYC status updated successfully to ${status}`,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with pagination, sorting, search, role and KYC status filtering (Managers only)
 */
export const listUsers = async (req, res, next) => {
  try {
    const { page, limit, role, kycStatus, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};


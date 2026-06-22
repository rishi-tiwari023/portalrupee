import mongoose from 'mongoose';
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

    const accounts = await Account.find({ user: userId }).lean();
    const accountIds = accounts.map(acc => acc._id);

    const accountsWithTx = await Promise.all(
      accounts.map(async (account) => {
        const lastTransaction = await Transaction.findOne({
          $or: [
            { senderAccount: account._id },
            { receiverAccount: account._id }
          ],
          status: 'SUCCESS'
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...account,
          lastTransaction: lastTransaction ? {
            amount: lastTransaction.amount,
            type: lastTransaction.type,
            senderAccount: lastTransaction.senderAccount,
            receiverAccount: lastTransaction.receiverAccount,
            createdAt: lastTransaction.createdAt,
            description: lastTransaction.description,
          } : null
        };
      })
    );

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
        accounts: accountsWithTx,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};


const getTrendPlaceholders = (startDate, endDate, format) => {
  const placeholders = {};
  const current = new Date(startDate);

  if (format === '%Y-%m-%d') {
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      placeholders[dateStr] = 0;
      current.setUTCDate(current.getUTCDate() + 1);
    }
  } else if (format === '%Y-%m') {
    current.setUTCDate(1);
    while (current <= endDate) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const dateStr = `${year}-${month}`;
      placeholders[dateStr] = 0;
      current.setUTCMonth(current.getUTCMonth() + 1);
    }
  }
  return placeholders;
};

/**
 * @desc    Get expenditure analytics and spending patterns
 * @route   GET /api/v1/dashboard/analytics
 * @access  Private
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d', startDate, endDate } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const accounts = await Account.find({ user: userId });
    const accountIds = accounts.map(acc => acc._id);

    // If user has no accounts, return empty analytics payload instead of failing
    if (accountIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          summary: {
            totalSpent: 0,
            prevTotalSpent: 0,
            percentageChange: 0,
            averageTransactionSize: 0,
            maxTransactionSize: 0,
            totalTransactions: 0
          },
          inflowVsOutflow: {
            inflow: 0,
            outflow: 0,
            netSavings: 0
          },
          spendingTrend: [],
          categoryBreakdown: [],
          typeBreakdown: []
        }
      });
    }

    const now = new Date();
    let startDateObj;
    let endDateObj;
    let prevStartDateObj;
    let prevEndDateObj;
    let dateFormat;

    if (timeRange === '7d') {
      endDateObj = now;
      startDateObj = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEndDateObj = startDateObj;
      prevStartDateObj = new Date(startDateObj.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
    } else if (timeRange === '30d') {
      endDateObj = now;
      startDateObj = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevEndDateObj = startDateObj;
      prevStartDateObj = new Date(startDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
    } else if (timeRange === '12m') {
      endDateObj = now;
      startDateObj = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      prevEndDateObj = startDateObj;
      prevStartDateObj = new Date(startDateObj.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m';
    } else if (timeRange === 'custom') {
      endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);

      const duration = endDateObj.getTime() - startDateObj.getTime();
      prevEndDateObj = startDateObj;
      prevStartDateObj = new Date(startDateObj.getTime() - duration);
      dateFormat = duration > 45 * 24 * 60 * 60 * 1000 ? '%Y-%m' : '%Y-%m-%d';
    }

    // 1. Match condition for User Outflows (WITHDRAW/TRANSFER where user is sender)
    const outflowMatch = {
      status: 'SUCCESS',
      type: { $in: ['WITHDRAW', 'TRANSFER'] },
      $or: [
        { sender: new mongoose.Types.ObjectId(userId) },
        { senderAccount: { $in: accountIds } }
      ],
      createdAt: { $gte: startDateObj, $lte: endDateObj }
    };

    // 2. Summary Statistics (comparing current vs previous period)
    const summaryMatch = {
      status: 'SUCCESS',
      type: { $in: ['WITHDRAW', 'TRANSFER'] },
      $or: [
        { sender: new mongoose.Types.ObjectId(userId) },
        { senderAccount: { $in: accountIds } }
      ],
      createdAt: { $gte: prevStartDateObj, $lte: endDateObj }
    };

    const summaryStats = await Transaction.aggregate([
      { $match: summaryMatch },
      {
        $project: {
          amount: 1,
          period: {
            $cond: {
              if: { $gte: ['$createdAt', startDateObj] },
              then: 'current',
              else: 'previous'
            }
          }
        }
      },
      {
        $group: {
          _id: '$period',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    const currentStats = summaryStats.find(s => s._id === 'current') || { totalAmount: 0, count: 0, avgAmount: 0, maxAmount: 0 };
    const prevStats = summaryStats.find(s => s._id === 'previous') || { totalAmount: 0, count: 0, avgAmount: 0, maxAmount: 0 };

    let percentageChange = 0;
    if (prevStats.totalAmount > 0) {
      percentageChange = parseFloat((((currentStats.totalAmount - prevStats.totalAmount) / prevStats.totalAmount) * 100).toFixed(2));
    } else if (currentStats.totalAmount > 0) {
      percentageChange = 100;
    }

    const summary = {
      totalSpent: currentStats.totalAmount,
      prevTotalSpent: prevStats.totalAmount,
      percentageChange,
      averageTransactionSize: parseFloat((currentStats.avgAmount || 0).toFixed(2)),
      maxTransactionSize: currentStats.maxAmount || 0,
      totalTransactions: currentStats.count || 0
    };

    // 3. Spending Trend (group by date)
    const trendPipeline = [
      { $match: outflowMatch },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const rawTrend = await Transaction.aggregate(trendPipeline);

    // Populate zero-filled placeholders
    const placeholders = getTrendPlaceholders(startDateObj, endDateObj, dateFormat);
    rawTrend.forEach(item => {
      placeholders[item._id] = item.amount;
    });
    const spendingTrend = Object.keys(placeholders).map(dateKey => ({
      date: dateKey,
      amount: placeholders[dateKey]
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 4. Category Breakdown
    const categoryPipeline = [
      { $match: outflowMatch },
      {
        $project: {
          amount: 1,
          category: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: {
                      input: { $ifNull: ['$description', ''] },
                      regex: 'food|dining|restaurant|swiggy|zomato|cafe|grocery|eat',
                      options: 'i'
                    }
                  },
                  then: 'Food & Dining'
                },
                {
                  case: {
                    $regexMatch: {
                      input: { $ifNull: ['$description', ''] },
                      regex: 'utility|bill|rent|electricity|water|recharge|gas|internet|phone|wifi',
                      options: 'i'
                    }
                  },
                  then: 'Utilities & Bills'
                },
                {
                  case: {
                    $regexMatch: {
                      input: { $ifNull: ['$description', ''] },
                      regex: 'amazon|flipkart|shopping|cloth|myntra|store|purchase',
                      options: 'i'
                    }
                  },
                  then: 'Shopping'
                },
                {
                  case: {
                    $regexMatch: {
                      input: { $ifNull: ['$description', ''] },
                      regex: 'travel|cab|uber|ola|fuel|petrol|diesel|flight|train|bus|ticket',
                      options: 'i'
                    }
                  },
                  then: 'Travel & Transport'
                },
                {
                  case: {
                    $regexMatch: {
                      input: { $ifNull: ['$description', ''] },
                      regex: 'invest|stock|mutual fund|gold|fd|sip|groww|zerodha',
                      options: 'i'
                    }
                  },
                  then: 'Investment & Savings'
                },
                {
                  case: { $eq: ['$type', 'TRANSFER'] },
                  then: 'Transfer Out'
                },
                {
                  case: { $eq: ['$type', 'WITHDRAW'] },
                  then: 'Cash Withdrawal'
                }
              ],
              default: 'Other'
            }
          }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ];
    const rawCategories = await Transaction.aggregate(categoryPipeline);
    const categoryBreakdown = rawCategories.map(c => ({
      category: c._id,
      amount: c.totalAmount,
      count: c.count,
      percentage: summary.totalSpent > 0 ? parseFloat(((c.totalAmount / summary.totalSpent) * 100).toFixed(2)) : 0
    }));

    // 5. Type Breakdown
    const typePipeline = [
      { $match: outflowMatch },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ];
    const rawTypes = await Transaction.aggregate(typePipeline);
    const typeBreakdown = rawTypes.map(t => ({
      type: t._id,
      amount: t.totalAmount,
      count: t.count
    }));

    // 6. Inflow vs Outflow
    const flowMatch = {
      status: 'SUCCESS',
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      $or: [
        { sender: new mongoose.Types.ObjectId(userId) },
        { receiver: new mongoose.Types.ObjectId(userId) },
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } }
      ]
    };

    const flowPipeline = [
      { $match: flowMatch },
      {
        $project: {
          amount: 1,
          direction: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$type', 'WITHDRAW'] },
                  {
                    $and: [
                      { $eq: ['$type', 'TRANSFER'] },
                      {
                        $or: [
                          { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                          { $in: ['$senderAccount', accountIds] }
                        ]
                      }
                    ]
                  }
                ]
              },
              then: 'outflow',
              else: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$type', 'DEPOSIT'] },
                      {
                        $and: [
                          { $eq: ['$type', 'TRANSFER'] },
                          {
                            $or: [
                              { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                              { $in: ['$receiverAccount', accountIds] }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  then: 'inflow',
                  else: 'unknown'
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$direction',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ];
    const rawFlow = await Transaction.aggregate(flowPipeline);
    const inflowData = rawFlow.find(f => f._id === 'inflow') || { totalAmount: 0 };
    const outflowData = rawFlow.find(f => f._id === 'outflow') || { totalAmount: 0 };

    const inflowVsOutflow = {
      inflow: inflowData.totalAmount,
      outflow: outflowData.totalAmount,
      netSavings: inflowData.totalAmount - outflowData.totalAmount
    };

    res.status(200).json({
      status: 'success',
      data: {
        summary,
        inflowVsOutflow,
        spendingTrend,
        categoryBreakdown,
        typeBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

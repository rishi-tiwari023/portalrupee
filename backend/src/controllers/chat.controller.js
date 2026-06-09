import mongoose from 'mongoose';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { checkChatPermission } from '../utils/chat.util.js';
import Message from '../models/message.model.js';

export const getChatRooms = async (req, res, next) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate unique transacted users
    const rooms = await Transaction.aggregate([
      // 1. Match transfer transactions where the current user is sender or receiver (success or failed)
      {
        $match: {
          type: 'TRANSFER',
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      // 2. Project the other participant and transaction details
      {
        $project: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          createdAt: 1,
          amount: 1,
          transactionId: 1,
          description: 1,
          status: 1
        }
      },
      // 3. Filter out any self-transfers (just in case)
      {
        $match: {
          otherUser: { $ne: currentUserId }
        }
      },
      // 4. Sort transactions by createdAt descending so the latest transaction is first
      {
        $sort: { createdAt: -1 }
      },
      // 5. Group by otherUser to get the most recent transaction details for each participant
      {
        $group: {
          _id: '$otherUser',
          lastTransaction: { $first: '$$ROOT' }
        }
      },
      // 6. Look up other user's information from users collection
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // 7. Deconstruct the user details array
      {
        $unwind: '$userDetails'
      },
      // 8. Format the final output
      {
        $project: {
          _id: 0,
          user: {
            _id: '$userDetails._id',
            firstName: '$userDetails.firstName',
            lastName: '$userDetails.lastName',
            email: '$userDetails.email',
            role: '$userDetails.role'
          },
          lastTransaction: {
            transactionId: '$lastTransaction.transactionId',
            amount: '$lastTransaction.amount',
            description: '$lastTransaction.description',
            status: '$lastTransaction.status',
            createdAt: '$lastTransaction.createdAt'
          }
        }
      },
      // 9. Sort the rooms list so that contacts with the most recent transaction appear first
      {
        $sort: { 'lastTransaction.createdAt': -1 }
      }
    ]);

    // Find all users the current user has messaged
    const messagedUsersAgg = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          createdAt: 1
        }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessageAt: { $max: '$createdAt' }
        }
      }
    ]);

    const existingUserIds = new Set(rooms.map(r => r.user._id.toString()));
    const missingUserIds = messagedUsersAgg
      .map(m => m._id)
      .filter(id => !existingUserIds.has(id.toString()));

    let combinedRooms = [...rooms];

    // Add lastActivity for sorting
    combinedRooms.forEach(r => {
      const msgAgg = messagedUsersAgg.find(m => m._id.toString() === r.user._id.toString());
      const txDate = new Date(r.lastTransaction.createdAt);
      const msgDate = msgAgg ? new Date(msgAgg.lastMessageAt) : new Date(0);
      r.lastActivity = txDate > msgDate ? txDate : msgDate;
    });

    if (missingUserIds.length > 0) {
      const missingUsers = await User.find({ _id: { $in: missingUserIds } }).select('firstName lastName email role');
      
      const additionalRooms = missingUsers.map(u => {
        const msgAgg = messagedUsersAgg.find(m => m._id.toString() === u._id.toString());
        return {
          user: {
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role
          },
          lastTransaction: null,
          lastActivity: msgAgg ? msgAgg.lastMessageAt : new Date(0)
        };
      });

      combinedRooms = [...combinedRooms, ...additionalRooms];
    }

    // Sort combined rooms by lastActivity descending
    combinedRooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.status(200).json({
      status: 'success',
      results: combinedRooms.length,
      data: {
        rooms: combinedRooms
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkPermission = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return next(new AppError('Invalid target user ID', 400));
    }

    const targetUserExists = await User.exists({ _id: targetUserId });
    if (!targetUserExists) {
      return next(new AppError('Target user not found', 404));
    }

    const hasPermission = await checkChatPermission(req.user.id, targetUserId);

    res.status(200).json({
      status: 'success',
      data: {
        hasPermission
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return next(new AppError('Invalid target user ID', 400));
    }

    const targetUserExists = await User.exists({ _id: targetUserId });
    if (!targetUserExists) {
      return next(new AppError('Target user not found', 404));
    }

    const hasPermission = await checkChatPermission(currentUserId, targetUserId);
    if (!hasPermission) {
      return next(new AppError('Messaging is not allowed. No transaction history found between users.', 403));
    }

    const roomId = `chat_${[currentUserId.toString(), targetUserId.toString()].sort().join('_')}`;

    // Mark messages sent by the target user to the current user as read
    await Message.updateMany(
      { roomId, sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ roomId });

    res.status(200).json({
      status: 'success',
      results: messages.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalMessages / limit),
        totalResults: totalMessages
      },
      data: {
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

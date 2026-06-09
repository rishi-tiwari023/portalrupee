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
      // 1. Match successful transfer transactions where the current user is sender or receiver
      {
        $match: {
          type: 'TRANSFER',
          status: 'SUCCESS',
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
          description: 1
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
            createdAt: '$lastTransaction.createdAt'
          }
        }
      },
      // 9. Sort the rooms list so that contacts with the most recent transaction appear first
      {
        $sort: { 'lastTransaction.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      data: {
        rooms
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

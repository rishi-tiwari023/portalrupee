import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import AppError from '../utils/AppError.js';

/**
 * Transfer money from current user to another user
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

    const transaction = await Transaction.create(
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
        transaction: transaction[0],
        newBalance: senderAccount.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'],
      default: 'TRANSFER',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS', // Default to SUCCESS for immediate atomic transfers
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      unique: true,
      default: () => `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster history lookups
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

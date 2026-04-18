import mongoose from 'mongoose';
import crypto from 'crypto';

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: function () {
        return this.type === 'WITHDRAW' || this.type === 'TRANSFER';
      },
    },
    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: function () {
        return this.type === 'DEPOSIT' || this.type === 'TRANSFER';
      },
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'],
      required: [true, 'Transaction type is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    description: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      unique: true,
      default: () => `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ senderAccount: 1 });
transactionSchema.index({ receiverAccount: 1 });
transactionSchema.index({ transactionId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

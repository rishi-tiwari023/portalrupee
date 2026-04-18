import mongoose from 'mongoose';
import crypto from 'crypto';

const transactionSchema = new mongoose.Schema(
  {
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
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'],
      required: [true, 'Transaction type is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
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

// Index for faster lookups
transactionSchema.index({ senderAccount: 1 });
transactionSchema.index({ receiverAccount: 1 });
transactionSchema.index({ referenceId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

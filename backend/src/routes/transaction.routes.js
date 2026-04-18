import express from 'express';
import {
  deposit,
  withdraw,
  transferMoney,
} from '../controllers/transaction.controller.js';
import { isAuth, verifyTPIN } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  depositSchema,
  withdrawSchema,
  transferSchema,
} from '../validators/transaction.validator.js';

const router = express.Router();

// All transaction routes require authentication
router.use(isAuth);

/**
 * @route   POST /api/v1/transactions/deposit
 * @desc    Deposit money to an account
 * @access  Private
 */
router.post('/deposit', validate(depositSchema), deposit);

/**
 * @route   POST /api/v1/transactions/withdraw
 * @desc    Withdraw money from an account
 * @access  Private
 */
router.post('/withdraw', validate(withdrawSchema), withdraw);

/**
 * @route   POST /api/v1/transactions/transfer
 * @desc    Transfer money between accounts
 * @access  Private (TPIN Verified)
 */
router.post('/transfer', verifyTPIN, validate(transferSchema), transferMoney);

export default router;

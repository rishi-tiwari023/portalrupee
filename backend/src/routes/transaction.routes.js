import express from 'express';
import {
  deposit,
  withdraw,
  transferMoney,
  getTransactionHistory,
  generateStatement,
} from '../controllers/transaction.controller.js';
import { isAuth, verifyTPIN } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  depositSchema,
  withdrawSchema,
  transferSchema,
  getTransactionHistorySchema,
  generateStatementSchema,
} from '../validators/transaction.validator.js';

const router = express.Router();

// All transaction routes require authentication
router.use(isAuth);

/**
 * @route   POST /api/v1/transactions/deposit
 * @desc    Deposit money to an account
 * @access  Private
 */
router.post('/deposit', auditLogger('DEPOSIT', 'TRANSACTION'), validate(depositSchema), deposit);

/**
 * @route   POST /api/v1/transactions/withdraw
 * @desc    Withdraw money from an account
 * @access  Private
 */
router.post('/withdraw', auditLogger('WITHDRAW', 'TRANSACTION'), validate(withdrawSchema), withdraw);

router.post('/transfer', verifyTPIN, auditLogger('TRANSFER', 'TRANSACTION'), validate(transferSchema), transferMoney);

/**
 * @route   GET /api/v1/transactions/statement
 * @desc    Generate PDF statement
 * @access  Private
 */
router.get('/statement', validate(generateStatementSchema), generateStatement);

/**
 * @route   GET /api/v1/transactions
 * @desc    Get transaction history with filters and pagination
 * @access  Private
 */
router.get('/', validate(getTransactionHistorySchema), getTransactionHistory);

export default router;

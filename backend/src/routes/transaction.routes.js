import express from 'express';
import {
  deposit,
  withdraw,
  transferMoney,
  getTransactionHistory,
  generateStatement,
  getPendingDeposits,
  approveDeposit,
} from '../controllers/transaction.controller.js';
import { isAuth, verifyTPIN, checkRole } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  depositSchema,
  withdrawSchema,
  transferSchema,
  getTransactionHistorySchema,
  generateStatementSchema,
  approveDepositSchema,
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
 * @route   GET /api/v1/transactions/pending-deposits
 * @desc    Get all pending deposit transactions
 * @access  Private (CASHIER, MANAGER)
 */
router.get('/pending-deposits', checkRole('CASHIER', 'MANAGER'), getPendingDeposits);

/**
 * @route   PATCH /api/v1/transactions/:id/approve
 * @desc    Approve or reject a pending deposit transaction
 * @access  Private (CASHIER, MANAGER)
 */
router.patch('/:id/approve', checkRole('CASHIER', 'MANAGER'), auditLogger('APPROVE_DEPOSIT', 'TRANSACTION'), validate(approveDepositSchema), approveDeposit);

/**
 * @route   GET /api/v1/transactions
 * @desc    Get transaction history with filters and pagination
 * @access  Private
 */
router.get('/', validate(getTransactionHistorySchema), getTransactionHistory);

export default router;

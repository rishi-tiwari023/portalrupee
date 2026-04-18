import express from 'express';
import { transferMoney } from '../controllers/transaction.controller.js';
import { isAuth, verifyTPIN } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { transferSchema } from '../validators/transaction.validator.js';

const router = express.Router();

// Protect all transaction routes
router.use(isAuth);

/**
 * @route   POST /api/v1/transactions/transfer
 * @desc    Transfer money between accounts
 * @access  Private (Authenticated + TPIN verified)
 */
router.post(
  '/transfer',
  verifyTPIN,
  validate(transferSchema),
  transferMoney
);

export default router;

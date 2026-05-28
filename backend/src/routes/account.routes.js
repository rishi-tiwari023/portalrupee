import express from 'express';
import {
  createAccount,
  getMyAccounts,
  getAccountDetails,
  getAccountBalance,
  updateAccountStatus,
  getAllAccounts,
  getAccountByNumber
} from '../controllers/account.controller.js';
import { isAuth, checkRole } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  createAccountSchema,
  updateStatusSchema,
  getAccountByNumberSchema,
  getAccountDetailsSchema,
  getAccountBalanceSchema,
} from '../validators/account.validator.js';

const router = express.Router();

router.use(isAuth);

router.post('/', auditLogger('CREATE_ACCOUNT', 'ACCOUNT'), validate(createAccountSchema), createAccount);
router.get('/', getMyAccounts);
router.get('/admin/all', checkRole('MANAGER'), getAllAccounts);
router.get('/number/:accountNumber', validate(getAccountByNumberSchema), getAccountByNumber);
router.get('/:id', validate(getAccountDetailsSchema), getAccountDetails);
router.post('/:id/balance', validate(getAccountBalanceSchema), getAccountBalance);

router.patch('/:id/status', checkRole('MANAGER'), auditLogger('UPDATE_ACCOUNT_STATUS', 'ACCOUNT'), validate(updateStatusSchema), updateAccountStatus);


export default router;

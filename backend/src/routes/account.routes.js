import express from 'express';
import {
  createAccount,
  getMyAccounts,
  getAccountDetails,
  getAccountBalance,
  updateAccountStatus,
  getAllAccounts,
  getAccountByNumber,
  freezeAccount,
  unfreezeAccount
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
  freezeAccountSchema,
  unfreezeAccountSchema
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

router.patch('/:id/freeze', checkRole('MANAGER'), auditLogger('FREEZE_ACCOUNT', 'ACCOUNT'), validate(freezeAccountSchema), freezeAccount);

router.patch('/:id/unfreeze', checkRole('MANAGER'), auditLogger('UNFREEZE_ACCOUNT', 'ACCOUNT'), validate(unfreezeAccountSchema), unfreezeAccount);

export default router;

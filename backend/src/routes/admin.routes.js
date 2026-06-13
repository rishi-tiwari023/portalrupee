import express from 'express';
import {
  updateUserRole,
  getSystemStats,
  getKycQueue,
  updateKycStatus,
  listUsers,
} from '../controllers/admin.controller.js';
import { isAuth, checkRole } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  updateRoleSchema,
  updateKycStatusSchema,
  listUsersSchema,
} from '../validators/admin.validator.js';

const router = express.Router();

// Protect all routes and restrict to MANAGER
router.use(isAuth);
router.use(checkRole('MANAGER'));

// System stats
router.get('/stats', getSystemStats);

// User listing
router.get('/users', validate(listUsersSchema), listUsers);

// KYC approval queue
router.get('/kyc/queue', getKycQueue);

// Update user KYC status (supports audit logging)
router.patch(
  '/users/:id/kyc',
  auditLogger('VERIFY_KYC', 'USER'),
  validate(updateKycStatusSchema),
  updateKycStatus
);

// Update user role
router.patch(
  '/users/:userId/role',
  validate(updateRoleSchema),
  updateUserRole
);

export default router;


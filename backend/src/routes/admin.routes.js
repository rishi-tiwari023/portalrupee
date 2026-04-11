import express from 'express';
import { updateUserRole } from '../controllers/admin.controller.js';
import { isAuth, checkRole } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { updateRoleSchema } from '../validators/admin.validator.js';

const router = express.Router();

// Protect all routes and restrict to MANAGER
router.use(isAuth);
router.use(checkRole('MANAGER'));

router.patch(
  '/users/:userId/role',
  validate(updateRoleSchema),
  updateUserRole
);

export default router;

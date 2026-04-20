import express from 'express';
import {
  getProfile,
  updateProfile,
  searchUsers,
} from '../controllers/user.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  updateProfileSchema,
  searchUserSchema,
} from '../validators/user.validator.js';

const router = express.Router();

// Protect all routes
router.use(isAuth);

router.get('/profile', getProfile);
router.patch('/profile', auditLogger('UPDATE_PROFILE', 'USER'), validate(updateProfileSchema), updateProfile);
router.get('/search', validate(searchUserSchema), searchUsers);

export default router;

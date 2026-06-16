import express from 'express';
import {
  getProfile,
  updateProfile,
  searchUsers,
  submitKYC,
  updateProfileImage,
} from '../controllers/user.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import validate from '../middleware/validate.js';
import {
  updateProfileSchema,
  searchUserSchema,
  submitKYCSchema,
  updateProfileImageSchema,
} from '../validators/user.validator.js';

const router = express.Router();

// Protect all routes
router.use(isAuth);

router.get('/profile', getProfile);
router.patch('/profile', auditLogger('UPDATE_PROFILE', 'USER'), validate(updateProfileSchema), updateProfile);
router.patch('/profile/image', auditLogger('UPDATE_PROFILE_IMAGE', 'USER'), validate(updateProfileImageSchema), updateProfileImage);
router.get('/search', validate(searchUserSchema), searchUsers);
router.post('/kyc', auditLogger('SUBMIT_KYC', 'USER'), validate(submitKYCSchema), submitKYC);

export default router;

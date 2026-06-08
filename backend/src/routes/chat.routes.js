import express from 'express';
import { getChatRooms, checkPermission } from '../controllers/chat.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(isAuth);

router.route('/rooms').get(getChatRooms);
router.route('/permission/:targetUserId').get(checkPermission);

export default router;

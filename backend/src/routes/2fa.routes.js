import express from 'express';
import * as twoFactorController from '../controllers/2fa.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(isAuth);

router.get('/setup', twoFactorController.get2FASetup);
router.post('/enable', twoFactorController.enable2FA);
router.post('/disable', twoFactorController.disable2FA);

export default router;

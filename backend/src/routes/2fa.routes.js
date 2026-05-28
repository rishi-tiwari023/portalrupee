import express from 'express';
import * as twoFactorController from '../controllers/2fa.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { toggle2FASchema } from '../validators/2fa.validator.js';

const router = express.Router();
router.use(isAuth);

router.get('/setup', twoFactorController.get2FASetup);
router.post('/enable', validate(toggle2FASchema), twoFactorController.enable2FA);
router.post('/disable', validate(toggle2FASchema), twoFactorController.disable2FA);


export default router;

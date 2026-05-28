import express from 'express';
import { register, login, verify2FA, sendOTP, verifyOTP, resetPassword, disable2FALogin } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  verify2FASchema,
  disable2FALoginSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-2fa', authLimiter, validate(verify2FASchema), verify2FA);
router.post('/disable-2fa-login', authLimiter, validate(disable2FALoginSchema), disable2FALogin);
router.post('/send-otp', authLimiter, validate(sendOTPSchema), sendOTP);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), verifyOTP);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);


export default router;

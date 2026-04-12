import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

export default router;

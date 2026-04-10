import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;

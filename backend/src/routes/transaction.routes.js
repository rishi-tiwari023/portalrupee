import express from 'express';
import { deposit, withdraw } from '../controllers/transaction.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { depositSchema, withdrawSchema } from '../validators/transaction.validator.js';

const router = express.Router();

// All transaction routes require authentication
router.use(isAuth);

router.post('/deposit', validate(depositSchema), deposit);
router.post('/withdraw', validate(withdrawSchema), withdraw);

export default router;

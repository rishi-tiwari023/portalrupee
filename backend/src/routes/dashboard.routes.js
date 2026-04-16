import express from 'express';
import { getSummary } from '../controllers/dashboard.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuth);

router.get('/summary', getSummary);

export default router;

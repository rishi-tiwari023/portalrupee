import express from 'express';
import { getSummary, getAnalytics } from '../controllers/dashboard.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { getAnalyticsSchema } from '../validators/dashboard.validator.js';

const router = express.Router();

router.use(isAuth);

router.get('/summary', getSummary);
router.get('/analytics', validate(getAnalyticsSchema), getAnalytics);

export default router;

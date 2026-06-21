import express from 'express';
import { sendEmiDetailsEmail } from '../controllers/calculator.controller.js';

const router = express.Router();

router.post('/emi-mail', sendEmiDetailsEmail);

export default router;

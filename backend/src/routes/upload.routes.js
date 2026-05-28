import express from 'express';
import { uploadFile, viewFile, getUrl } from '../controllers/upload.controller.js';
import upload from '../middleware/upload.middleware.js';
import { isAuth } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { viewFileSchema, getUrlSchema } from '../validators/upload.validator.js';

const router = express.Router();

// Upload endpoint - requires auth and parses single multi-part form field named 'file'
router.post('/', isAuth, upload.single('file'), uploadFile);

// Secure viewing endpoint - uses HMAC signature validation or isAuth
router.get('/view/:key', validate(viewFileSchema), viewFile); 

// Secure get URL endpoint - returns JSON
router.get('/url/:key', isAuth, validate(getUrlSchema), getUrl);


export default router;

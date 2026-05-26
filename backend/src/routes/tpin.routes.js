import express from 'express';
import * as tpinController from '../controllers/tpin.controller.js';
import { isAuth } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { setTPINSchema, changeTPINSchema, resetTPINSchema } from '../validators/tpin.validator.js';

const router = express.Router();

router.use(isAuth);

router.post('/set', validate(setTPINSchema), tpinController.setTPIN);
router.put('/change', validate(changeTPINSchema), tpinController.changeTPIN);
router.post('/reset', validate(resetTPINSchema), tpinController.resetTPIN);


export default router;

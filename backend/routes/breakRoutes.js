import express from 'express';
import * as breakController from '../controllers/breakController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', breakController.getBreaks);
router.post('/start', breakController.startBreak);
router.post('/end', breakController.endBreak);

export default router;

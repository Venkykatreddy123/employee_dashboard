import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', leaveController.getLeaves);
router.post('/', leaveController.applyLeave);
router.put('/:id', leaveController.updateStatus);

export default router;

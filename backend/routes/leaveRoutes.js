import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Original routes
router.get('/', leaveController.getLeaves);
router.post('/', leaveController.applyLeave);
router.put('/:id', leaveController.updateStatus);

// Frontend specific routes
router.get('/all-pending', leaveController.getPendingLeaves);
router.post('/update-status', leaveController.updateLeaveStatus);
router.post('/apply', leaveController.applyLeave);

export default router;

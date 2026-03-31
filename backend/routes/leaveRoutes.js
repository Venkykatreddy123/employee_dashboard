import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

const adminOrManager = roleMiddleware(['admin', 'manager']);

// Original routes
router.get('/', leaveController.getLeaves);
router.post('/', leaveController.applyLeave);
router.put('/:id', adminOrManager, leaveController.updateStatus);

// Frontend specific routes
router.get('/all-pending', adminOrManager, leaveController.getPendingLeaves);
router.post('/update-status', adminOrManager, leaveController.updateLeaveStatus);
router.post('/apply', leaveController.applyLeave);

export default router;

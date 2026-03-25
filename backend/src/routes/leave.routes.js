const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/apply', protect, leaveController.applyLeave);
router.get('/my', protect, leaveController.getLeaves);
router.post('/cancel/:id', protect, leaveController.cancelLeave);
router.get('/balance', protect, leaveController.getLeaveBalances);
router.get('/team', protect, authorize(['manager', 'admin']), leaveController.getTeamLeaves);
router.get('/all-pending', protect, authorize(['manager', 'admin']), leaveController.getAllPendingLeaves);
router.post('/update-status', protect, authorize(['manager', 'admin']), leaveController.updateLeaveStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { applyLeave, updateLeaveStatus, getLeaves } = require('../controllers/leaveController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', applyLeave);
router.get('/', getLeaves);
router.put('/:id', verifyAdmin, updateLeaveStatus); // Only Admins can approve/reject

module.exports = router;

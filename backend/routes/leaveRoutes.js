const express = require('express');
const router = express.Router();
const { applyLeave, approveLeave, getLeaves } = require('../controllers/leaveController');
const { authenticateToken, verifyAdmin, verifyManager } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/apply', applyLeave);
router.get('/', getLeaves);
router.post('/approve', verifyAdmin, approveLeave); // Match frontend call

module.exports = router;

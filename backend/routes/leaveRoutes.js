const express = require('express');
const router = express.Router();
const { requestLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Personnel lifecycle history (scoped by individual identity)
router.get('/my-history/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getMyLeaves);

// Organizational lifecycle monitoring (Admin/HR Tiers)
router.get('/all', authorize(['Admin', 'HR']), getAllLeaves);

// Lifecycle request synchronization
router.post('/request', authorize(['Employee', 'Admin', 'Manager', 'HR']), requestLeave);

// Lifecycle status modification (Admin Tiers)
router.put('/update-status', authorize(['Admin', 'HR']), updateLeaveStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyHistory, getAllAttendance } = require('../controllers/attendanceController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Personnel operational history (scoped by individual identity)
router.get('/my-history/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getMyHistory);

// Organizational pulse monitoring (Admin/HR Tiers)
router.get('/all', authorize(['Admin', 'HR']), getAllAttendance);

// Operational pulse synchronization (Arrival/Departure)
router.post('/check-in', authorize(['Employee', 'Admin', 'Manager', 'HR']), checkIn);
router.post('/check-out', authorize(['Employee', 'Admin', 'Manager', 'HR']), checkOut);

module.exports = router;

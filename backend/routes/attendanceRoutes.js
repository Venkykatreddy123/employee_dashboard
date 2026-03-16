const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance, manualLog, updateIdleTime } = require('../controllers/attendanceController');
const { authenticateToken, verifyManagerOrAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.post('/manual', verifyManagerOrAdmin, manualLog);
router.put('/idle', updateIdleTime);
router.get('/', getAttendance);

module.exports = router;

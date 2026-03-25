const express = require('express');
const router = express.Router();
const { getEmployeePerformance, addPerformanceRecord } = require('../controllers/performanceController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Employee can only see their own performance metrics
router.get('/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getEmployeePerformance);

// Only Admin/Manager can log new performance records
router.post('/', authorize(['Admin', 'Manager']), addPerformanceRecord);

module.exports = router;

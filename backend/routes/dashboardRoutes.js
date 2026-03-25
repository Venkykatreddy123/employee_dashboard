const express = require('express');
const router = express.Router();
const { getDashboardStats, getEmployeeStats } = require('../controllers/dashboardController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Admin dashboard access
router.get('/admin', authorize(['Admin', 'Manager', 'HR']), getDashboardStats);

// Filtered dashboard for individual employees
router.get('/employee/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getEmployeeStats);

module.exports = router;

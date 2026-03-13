const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Dashboard stats are mostly for admins, but giving basic access to employee view is okay
// Restricting it to admin as defined in the request
router.get('/stats', verifyAdmin, getDashboardStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { upsertSalary, getSalaryByEmployee, getAllSalaries } = require('../controllers/salaryController');

// Admin can add/update salaries
router.post('/', verifyToken, authorizeRoles('Admin'), upsertSalary);

// Admin can see all salaries
router.get('/all', verifyToken, authorizeRoles('Admin'), getAllSalaries);

// Employee can see their own history
router.get('/:userId', verifyToken, getSalaryByEmployee);

module.exports = router;

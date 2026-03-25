const express = require('express');
const router = express.Router();
const tursoController = require('../controllers/tursoController');

// User operations
router.post('/users', tursoController.createUser);
router.get('/users', tursoController.getUsers);

// Employee operations
router.post('/employees', tursoController.addEmployee);
router.get('/employees', tursoController.getEmployees);

// Attendance operations
router.post('/attendance', tursoController.markAttendance);

module.exports = router;

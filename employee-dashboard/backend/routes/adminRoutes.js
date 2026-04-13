const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const adminOnly = [authMiddleware, roleMiddleware(['admin', 'Admin'])];

// Dashboard Summary
router.get('/summary', adminOnly, adminController.getSummary);

// User Management
router.get('/users', adminOnly, adminController.getAllUsers);
router.post('/users', adminOnly, adminController.createUser);
router.put('/users/:id', adminOnly, adminController.updateUser);
router.delete('/users/:id', adminOnly, adminController.deleteUser);

// Managers List (for dropdowns)
router.get('/managers', adminOnly, adminController.getManagers);

// Payroll
router.get('/payroll', adminOnly, adminController.payroll.getAll);
router.post('/payroll', adminOnly, adminController.payroll.create);
router.put('/payroll/:id', adminOnly, adminController.payroll.update);
router.put('/payroll/:id/status', adminOnly, adminController.payroll.updateStatus);
router.delete('/payroll/:id', adminOnly, adminController.payroll.delete);

// Attendance & Leaves
router.get('/attendance', adminOnly, adminController.getAllAttendance);
router.get('/leaves', adminOnly, adminController.getAllLeaves);

// Projects
router.get('/projects', adminOnly, adminController.getAdminProjects);

module.exports = router;

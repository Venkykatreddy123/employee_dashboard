const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createUser, updateUser, deleteUser, getAllData, generatePayslips, getAllPayslips } = require('../controllers/adminController');

// Admin routes - ensure authenticated and Admin role
router.use(verifyToken);
const isAdmin = authorizeRoles('Admin');


// User CRUD Management
router.post('/users', isAdmin, createUser);
router.put('/users/:id', isAdmin, updateUser);
router.delete('/users/:id', isAdmin, deleteUser);

// Global State
router.get('/all-data', isAdmin, getAllData);

// Payslips (Admin)
router.post('/admin/generate-payslips', isAdmin, generatePayslips);
router.get('/admin/payslips', isAdmin, getAllPayslips);


module.exports = router;

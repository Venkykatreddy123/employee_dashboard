const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { 
    getMyPayslips, 
    downloadPayslipPDF, 
    generateMonthlyPayslips, 
    getEmployeePayslips 
} = require('../controllers/payslipController');

// Admin can generate payslips for all employees
router.post('/generate', verifyToken, authorizeRoles('Admin'), generateMonthlyPayslips);

// Logged-in employee can see their own payslips
// The user asked for /api/payslips/employee/:employeeId to be for the "logged-in employee"
router.get('/employee/:employeeId', verifyToken, getEmployeePayslips);

// For backward compatibility or extra ease
router.get('/my', verifyToken, getMyPayslips);

// Download PDF
router.get('/:id/download', verifyToken, downloadPayslipPDF);
router.get('/:id/pdf', verifyToken, downloadPayslipPDF);

module.exports = router;

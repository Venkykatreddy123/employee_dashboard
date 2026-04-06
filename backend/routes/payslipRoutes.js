const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getMyPayslips, downloadPayslipPDF } = require('../controllers/payslipController');
// Employee (and any user) can see their own payslips
router.get('/my', verifyToken, getMyPayslips);

// Download PDF
router.get('/:id/download', verifyToken, downloadPayslipPDF);
router.get('/:id/pdf', verifyToken, downloadPayslipPDF);

module.exports = router;

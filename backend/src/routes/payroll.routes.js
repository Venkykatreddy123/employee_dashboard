const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/my', protect, payrollController.getMyPayslips);
router.get('/all', protect, authorize(['manager', 'admin']), payrollController.getAllPayslips);
router.post('/generate', protect, authorize('admin'), payrollController.createPayslip);

module.exports = router;

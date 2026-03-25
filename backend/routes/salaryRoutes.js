const express = require('express');
const router = express.Router();
const { getEmployeeSalaries, generatePayslip, createSalary } = require('../controllers/salaryController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * Administrative Core - Strategic Disbursement Logic
 */
router.post('/', authorize(['Admin', 'HR']), createSalary);

/**
 * Access to Individual Historical Financial Registries
 */
router.get('/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getEmployeeSalaries);

/**
 * High-Fidelity Payslip Generation (Digital ID Scoped)
 */
router.get('/:id/payslip/:month-:year', authorize(['Employee', 'Admin', 'Manager', 'HR']), generatePayslip);

module.exports = router;

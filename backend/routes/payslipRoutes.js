import express from 'express';
import { getPayslips, generatePayslip } from '../controllers/payslipController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/:employeeId', getPayslips);
router.post('/generate', generatePayslip);

export default router;

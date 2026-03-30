import express from 'express';
import { getPayslips, generatePayslip, generateAllPayslips } from '../controllers/payslipController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getPayslips);
router.post('/generate-all', generateAllPayslips);
router.post('/generate', generatePayslip);

export default router;

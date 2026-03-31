import express from 'express';
import { getPayslips, generatePayslip, generateAllPayslips } from '../controllers/payslipController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getPayslips);
router.post('/generate-all', roleMiddleware(['admin', 'manager']), generateAllPayslips);
router.post('/generate', roleMiddleware(['admin', 'manager']), generatePayslip);

export default router;

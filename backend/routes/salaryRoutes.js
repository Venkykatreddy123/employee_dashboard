import express from 'express';
import { updateSalary, getSalary } from '../controllers/salaryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', roleMiddleware(['admin', 'manager']), updateSalary);
router.get('/:employeeId', getSalary);

export default router;

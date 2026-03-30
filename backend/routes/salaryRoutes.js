import express from 'express';
import { updateSalary, getSalary } from '../controllers/salaryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', updateSalary);
router.get('/:employeeId', getSalary);

export default router;

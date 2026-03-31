import express from 'express';
import { db } from '../db.js';
import * as employeeController from '../controllers/employeeController.js';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

const adminOrManager = roleMiddleware(['admin', 'manager']);

router.get('/', employeeController.getAllEmployees);
router.get('/managers', employeeController.getManagers);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', adminOrManager, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    const plainTextPassword = password || 'standardpass123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

    await db.execute({
      sql: `INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)`,
      args: [name, email, role, hashedPassword]
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

router.put('/:id', adminOrManager, employeeController.updateEmployee);
router.delete('/:id', adminOrManager, employeeController.deleteEmployee);

export default router;

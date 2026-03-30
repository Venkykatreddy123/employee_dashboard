import express from 'express';
import { db } from '../db.js';
import * as employeeController from '../controllers/employeeController.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

router.get('/', employeeController.getAllEmployees);
router.get('/managers', employeeController.getManagers);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    // Fallback password if frontend didn't send one
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

router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;

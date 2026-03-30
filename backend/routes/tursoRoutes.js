import express from 'express';
import * as tursoController from '../controllers/tursoController.js';

const router = express.Router();

// User operations
router.post('/users', tursoController.createUser);
router.get('/users', tursoController.getUsers);

// Employee operations
router.post('/employees', tursoController.addEmployee);
router.get('/employees', tursoController.getEmployees);

// Attendance operations
router.post('/attendance', tursoController.markAttendance);

export default router;

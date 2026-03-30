import { db } from '../db.js';
import bcrypt from 'bcryptjs';

// Create user
export const createUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required!' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.execute({
            sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            args: [name, email, hashedPassword]
        });

        res.status(201).json({
            message: 'User created successfully!',
            userId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const result = await db.execute('SELECT id, name, email FROM users');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

// Add employee
export const addEmployee = async (req, res) => {
    const { name, role, department } = req.body;

    if (!name || !role || !department) {
        return res.status(400).json({ message: 'Name, role, and department are required!' });
    }

    try {
        const result = await db.execute({
            sql: 'INSERT INTO employees (name, role, department) VALUES (?, ?, ?)',
            args: [name, role, department]
        });
        res.status(201).json({
            message: 'Employee added successfully!',
            employeeId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error adding employee', error: err.message });
    }
};

// Get all employees
export const getEmployees = async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM employees');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching employees', error: err.message });
    }
};

// Mark attendance
export const markAttendance = async (req, res) => {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
        return res.status(400).json({ message: 'employeeId, date, and status are required!' });
    }

    try {
        const result = await db.execute({
            sql: 'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
            args: [employeeId, date, status]
        });
        res.status(201).json({
            message: 'Attendance marked successfully!',
            attendanceId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error marking attendance', error: err.message });
    }
};

const db = require('../db');
const bcrypt = require('bcrypt');
const ActivityLog = require('../models/ActivityLog');

const getEmployees = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get employees error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const getEmployeeDirectory = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT name, email, department FROM users ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get directory error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const addEmployee = async (req, res) => {
    const { name, email, password, role_id, department, salary, joining_date, manager_id } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (name, email, password, role_id, department, salary, joining_date, manager_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [name, email, hashedPassword, role_id, department, salary, joining_date, manager_id]
        );

        await ActivityLog.create({
            userId: req.user.id,
            action: 'CREATE_EMPLOYEE',
            details: { name, email, role_id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Employee created successfully' });
    } catch (err) {
        console.error('Create employee error:', err);
        res.status(500).json({ error: err.message });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, role_id, department, salary, joining_date, manager_id } = req.body;

    try {
        await db.query(
            'UPDATE users SET name = $1, email = $2, role_id = $3, department = $4, salary = $5, joining_date = $6, manager_id = $7 WHERE id = $8',
            [name, email, role_id, department, salary, joining_date, manager_id, id]
        );

        await ActivityLog.create({
            userId: req.user.id,
            action: 'UPDATE_EMPLOYEE',
            details: { employee_id: id, name },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error('Update employee error:', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'DELETE_EMPLOYEE',
            details: { employee_id: id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Delete employee error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getEmployees, getEmployeeDirectory, addEmployee, updateEmployee, deleteEmployee };

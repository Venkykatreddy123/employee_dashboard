const db = require('../db');
const bcrypt = require('bcrypt');

const getEmployees = (req, res) => {
    db.all('SELECT id, name, email, role, department, salary, joining_date, manager_id, productivity_score FROM employees', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
};

const getEmployeeDirectory = (req, res) => {
    // Only fetch public info suitable for all employees
    db.all('SELECT id, name, role, department, joining_date FROM employees', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
};

const addEmployee = async (req, res) => {
    const { name, email, password, role, department, salary, joining_date, manager_id } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            'INSERT INTO employees (name, email, password, role, department, salary, joining_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'employee', department, salary, joining_date, manager_id || null],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, message: 'Employee added successfully' });
            }
        );
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, department, salary, joining_date, manager_id, productivity_score } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                'UPDATE employees SET name=?, email=?, password=?, role=?, department=?, salary=?, joining_date=?, manager_id=?, productivity_score=? WHERE id=?',
                [name, email, hashedPassword, role, department, salary, joining_date, manager_id, productivity_score, id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Employee updated successfully' });
                }
            );
        } else {
            db.run(
                'UPDATE employees SET name=?, email=?, role=?, department=?, salary=?, joining_date=?, manager_id=?, productivity_score=? WHERE id=?',
                [name, email, role, department, salary, joining_date, manager_id, productivity_score, id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Employee updated successfully' });
                }
            );
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteEmployee = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Employee deleted successfully' });
    });
};

module.exports = { getEmployees, getEmployeeDirectory, addEmployee, updateEmployee, deleteEmployee };

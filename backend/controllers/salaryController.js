import { db } from '../db.js';

export const updateSalary = async (req, res) => {
    try {
        const { employee_id, base_salary, bonus, deductions, month } = req.body;
        
        // Calculate the net
        const base = parseFloat(base_salary) || 0;
        const bns = parseFloat(bonus) || 0;
        const deduct = parseFloat(deductions) || 0;
        const net = base + bns - deduct;

        // Ensure user is verified as admin before editing
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
             return res.status(403).json({ message: 'Forbidden: Admins only' });
        }

        // Check if salary for month exists
        const existing = await db.execute({
            sql: 'SELECT id FROM salaries WHERE employee_id = ? AND month = ?',
            args: [employee_id, month]
        });

        if (existing.rows.length > 0) {
            await db.execute({
                sql: 'UPDATE salaries SET base_salary=?, bonus=?, deductions=?, net_salary=? WHERE id=?',
                args: [base, bns, deduct, net, existing.rows[0].id]
            });
            res.status(200).json({ success: true, message: 'Salary Updated' });
        } else {
            await db.execute({
                sql: 'INSERT INTO salaries (employee_id, base_salary, bonus, deductions, net_salary, month) VALUES (?, ?, ?, ?, ?, ?)',
                args: [employee_id, base, bns, deduct, net, month]
            });
            res.status(201).json({ success: true, message: 'Salary Recorded' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Salary update failed" });
    }
};

export const getSalary = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await db.execute({
            sql: 'SELECT s.*, u.name as employee FROM salaries s JOIN users u ON s.employee_id = u.id WHERE s.employee_id = ? ORDER BY id DESC',
            args: [employeeId]
        });
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch salary" });
    }
};

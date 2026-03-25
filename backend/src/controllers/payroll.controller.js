const { db } = require('../db/db');

exports.getMyPayslips = async (req, res) => {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM payslips WHERE user_id = ? ORDER BY year DESC, month DESC',
            args: [req.user.id]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPayslips = async (req, res) => {
    // Admin only
    try {
        const result = await db.execute(`
            SELECT p.*, u.name as user_name, e.employee_code 
            FROM payslips p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN employees e ON u.id = e.user_id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPayslip = async (req, res) => {
    const { user_id, month, year, base_salary, bonus, tax } = req.body;
    const net_salary = parseFloat(base_salary || 0) + parseFloat(bonus || 0) - parseFloat(tax || 0);
    
    try {
        await db.execute({
            sql: 'INSERT INTO payslips (user_id, month, year, base_salary, bonus, tax, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [user_id, month, year, base_salary, bonus, tax, net_salary]
        });
        res.json({ message: 'Payslip generated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

import { db } from '../db.js';

export const getPayslips = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await db.execute({
            sql: `
            SELECT p.id, p.month, p.generated_at, s.base_salary, s.bonus, s.deductions, s.net_salary, u.name as employee
            FROM payslips p
            JOIN salaries s ON p.salary_id = s.id
            JOIN users u ON p.employee_id = u.id
            WHERE p.employee_id = ?
            ORDER BY p.id DESC
            `,
            args: [employeeId]
        });
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch payslips" });
    }
};

export const generatePayslip = async (req, res) => {
    try {
        const { employee_id, month } = req.body;
        
        // Find salary record for that month
        const salaryInfo = await db.execute({
            sql: 'SELECT s.*, u.name as employee FROM salaries s JOIN users u ON s.employee_id = u.id WHERE s.employee_id = ? AND s.month = ?',
            args: [employee_id, month]
        });

        if (salaryInfo.rows.length === 0) {
            return res.status(404).json({ error: "Salary details for this month strictly missing. Please update salary matrix first." });
        }

        const sid = salaryInfo.rows[0].id;
        
        // Check if payslip already exists to avoid dupes
        const existing = await db.execute({
            sql: 'SELECT id FROM payslips WHERE salary_id = ?',
            args: [sid]
        });
        
        if (existing.rows.length === 0) {
            await db.execute({
                sql: 'INSERT INTO payslips (employee_id, salary_id, month) VALUES (?, ?, ?)',
                args: [employee_id, sid, month]
            });
        }
        
        res.status(200).json({
            employee: salaryInfo.rows[0].employee,
            base: salaryInfo.rows[0].base_salary,
            bonus: salaryInfo.rows[0].bonus,
            deductions: salaryInfo.rows[0].deductions,
            net: salaryInfo.rows[0].net_salary,
            month: salaryInfo.rows[0].month
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payslip generation securely failed." });
    }
};

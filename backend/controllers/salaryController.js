const { executeQuery } = require('../config/db');

/**
 * Add / Update salary for an employee (Admin)
 */
const upsertSalary = async (req, res) => {
  try {
    const { userId, month, year, baseSalary, bonus, allowances, deductions } = req.body;

    if (!userId || !month || !year || baseSalary === undefined) {
      return res.status(400).json({ success: false, message: 'UserId, month, year, and baseSalary are required' });
    }

    // Convert to numbers
    const bSalary = parseFloat(baseSalary);
    const bns = parseFloat(bonus || 0);
    const allwnc = parseFloat(allowances || 0);
    const ddnct = parseFloat(deductions || 0);
    const nSalary = bSalary + bns + allwnc - ddnct;

    // Check if salary record already exists for this employee, month, and year
    const existing = await executeQuery('SELECT id FROM SALARIES WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);

    if (existing.rows.length > 0) {
      // Update
      await executeQuery(
        'UPDATE SALARIES SET baseSalary = ?, bonus = ?, allowances = ?, deductions = ?, netSalary = ? WHERE id = ?',
        [bSalary, bns, allwnc, ddnct, nSalary, existing.rows[0].id]
      );
    } else {
      // Insert
      await executeQuery(
        'INSERT INTO SALARIES (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, month, year, bSalary, bns, allwnc, ddnct, nSalary]
      );
    }

    res.status(201).json({ success: true, message: 'Salary record saved successfully' });
  } catch (err) {
    console.error('❌ Salary Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing salary', error: err.message });
  }
};

/**
 * Fetch all salary records (Admin view)
 */
const getAllSalaries = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT s.*, u.name as employeeName, u.role, u.department
      FROM SALARIES s
      JOIN USERS u ON s.userId = u.id
      ORDER BY s.year DESC, s.month DESC
    `);
    res.json({ success: true, salaries: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching salaries', error: err.message });
  }
};

/**
 * Fetch salary history for an employee
 */
const getSalaryByEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await executeQuery(
      'SELECT * FROM SALARIES WHERE userId = ? ORDER BY year DESC, month DESC',
      [userId]
    );

    res.json({ success: true, salaries: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching salary', error: err.message });
  }
};

module.exports = { upsertSalary, getSalaryByEmployee, getAllSalaries };


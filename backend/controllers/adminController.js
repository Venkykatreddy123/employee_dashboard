const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password, role) are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await executeQuery(
      'INSERT INTO USERS (name, email, password, role, managerId) VALUES (?, ?, ?, ?, ?) RETURNING id, name, email, role, managerId',
      [name, email, hashedPassword, role, managerId || null]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error creating user', error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, managerId } = req.body;
    
    // Simplistic update for requirements (could expand for dynamic updates)
    const result = await executeQuery(
      'UPDATE USERS SET name = ?, email = ?, role = ?, managerId = ? WHERE id = ? RETURNING id, name, email, role, managerId',
      [name, email, role, managerId || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error updating user', error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await executeQuery('DELETE FROM USERS WHERE id = ? RETURNING id', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting user', error: err.message });
  }
};

// Get all data across entire organization
const getAllData = async (req, res) => {
  try {
    const [users, sessions, breaks, leaves, meetings] = await Promise.all([
      executeQuery('SELECT id, name, email, role, managerId FROM USERS'),
      executeQuery('SELECT * FROM SESSIONS'),
      executeQuery('SELECT * FROM BREAKS'),
      executeQuery('SELECT * FROM LEAVES'),
      executeQuery('SELECT * FROM MEETINGS')
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows,
        sessions: sessions.rows,
        breaks: breaks.rows,
        leaves: leaves.rows.map(l => ({ ...l, name: users.rows.find(u => u.id === l.userId)?.name || 'Unknown' })),
        meetings: meetings.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching organizational data', error: err.message });
  }
};

// Generate Payslips for current month
const generatePayslips = async (req, res) => {
  try {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();

    // Fetch all employees
    const employeesResult = await executeQuery('SELECT id, name, department, designation FROM USERS');
    const employees = employeesResult.rows;

    let generatedCount = 0;

    for (const emp of employees) {
      // Check if payslip already exists
      const existing = await executeQuery(
        'SELECT id FROM payslips WHERE employee_id = ? AND month = ? AND year = ?',
        [emp.id, month, year]
      );

      if (existing.rows.length === 0) {
        // Find salary
        const salaryResult = await executeQuery(
          'SELECT * FROM SALARIES WHERE userId = ? ORDER BY year DESC, month DESC LIMIT 1',
          [emp.id]
        );
        const salary = salaryResult.rows[0];

        const basic_salary = salary ? salary.baseSalary : 0;
        const allowances = salary ? (salary.allowances || 0) : 0;
        const bonuses = salary ? (salary.bonus || 0) : 0;
        const deductions = salary ? (salary.deductions || 0) : 0;
        const net_salary = basic_salary + allowances + bonuses - deductions;

        await executeQuery(
          `INSERT INTO payslips (
            employee_id, employee_name, department, designation, 
            month, year, basic_salary, allowances, bonuses, 
            deductions, net_salary
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.id, emp.name, emp.department || 'Engineering', emp.designation || 'Employee',
            month, year, basic_salary, allowances, bonuses,
            deductions, net_salary
          ]
        );
        generatedCount++;
      }
    }

    res.status(201).json({ success: true, message: `Successfully generated ${generatedCount} new payslips` });
  } catch (err) {
    console.error('❌ Generation Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error generating payslips', error: err.message });
  }
};

/**
 * Admin view all payslips
 */
const getAllPayslips = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT * FROM payslips
      ORDER BY year DESC, month DESC, created_at DESC
    `);
    res.json({ success: true, payslips: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching payslips', error: err.message });
  }
};


module.exports = { createUser, updateUser, deleteUser, getAllData, generatePayslips, getAllPayslips };

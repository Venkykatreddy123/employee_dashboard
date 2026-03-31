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

// Generate Payslips from Salary Records
const generatePayslips = async (req, res) => {
  try {
    // 1. Fetch all salary records
    const salaries = await executeQuery('SELECT * FROM SALARIES');
    
    if (salaries.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No salary records found' });
    }

    let generatedCount = 0;

    for (const salary of salaries.rows) {
      // Check if a payslip already exists for userId + month + year
      const existing = await executeQuery(
        'SELECT id FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', 
        [salary.userId, salary.month, salary.year]
      );
      
      if (existing.rows.length === 0) {
        // Calculate fields: netSalary = baseSalary + bonus + allowances - deductions
        const netSalary = salary.baseSalary + (salary.bonus || 0) + (salary.allowances || 0) - (salary.deductions || 0);

        // Insert into PAYSLIPS table
        await executeQuery(
          'INSERT INTO PAYSLIPS (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [salary.userId, salary.month, salary.year, salary.baseSalary, salary.bonus || 0, salary.allowances || 0, salary.deductions || 0, netSalary]
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
 * Admin view all payslips with auto-sync feature
 */
const getAllPayslips = async (req, res) => {
  try {
    // 1. AUTO-SYNC: Generate missing payslips for all salary records before listing
    const salaries = await executeQuery('SELECT * FROM SALARIES');
    for (const salary of salaries.rows) {
      const existing = await executeQuery(
        'SELECT id FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', 
        [salary.userId, salary.month, salary.year]
      );
      
      if (existing.rows.length === 0) {
        const netSalary = salary.baseSalary + (salary.bonus || 0) + (salary.allowances || 0) - (salary.deductions || 0);
        await executeQuery(
          'INSERT INTO PAYSLIPS (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [salary.userId, salary.month, salary.year, salary.baseSalary, salary.bonus || 0, salary.allowances || 0, salary.deductions || 0, netSalary]
        );
      }
    }

    // 2. FETCH LIST:
    const result = await executeQuery(`
      SELECT p.*, u.name as employeeName 
      FROM PAYSLIPS p
      JOIN USERS u ON p.userId = u.id
      ORDER BY p.year DESC, p.month DESC, p.generatedAt DESC
    `);
    res.json({ success: true, payslips: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching payslips', error: err.message });
  }
};


module.exports = { createUser, updateUser, deleteUser, getAllData, generatePayslips, getAllPayslips };

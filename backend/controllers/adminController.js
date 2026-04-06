const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, manager_id, department } = req.body;
    const emp_id = `EMP${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Using BCrypt for secure identity provisioning
    const hashedPassword = await bcrypt.hash(password, 10);

    await executeQuery(
      'INSERT INTO employees (emp_id, name, email, password, role, manager_id, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [emp_id, name, email, hashedPassword, role, manager_id || null, department || 'General']
    );

    // Sync with users table for unified authentication
    await executeQuery(
      'INSERT INTO users (email, password, role, emp_id, name) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, role, emp_id, name]
    );

    res.status(201).json({ success: true, message: 'Identity provisioned and synced to auth registry' });
  } catch (err) {
    console.error('Provisioning failure:', err.message);
    res.status(500).json({ success: false, message: 'Provisioning failed', error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, manager_id, department } = req.body;
    await executeQuery(
      'UPDATE employees SET name = ?, email = ?, role = ?, manager_id = ?, department = ? WHERE id = ?',
      [name, email, role, manager_id || null, department, id]
    );
    res.json({ success: true, message: 'Identity updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Get email to delete from users table
    const empResult = await executeQuery('SELECT email FROM employees WHERE id = ?', [id]);
    const email = empResult.rows[0]?.email;

    await executeQuery('DELETE FROM employees WHERE id = ?', [id]);
    
    if (email) {
      await executeQuery('DELETE FROM users WHERE email = ?', [email]);
    }

    res.json({ success: true, message: 'Identity purged from all registries' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Purge failed' });
  }
};

// Fetch all users with department info
const getUsers = async (req, res) => {
  try {
    const result = await executeQuery(`
        SELECT e.id, e.emp_id, e.name, e.email, e.role, e.created_at, d.name as department_name 
        FROM employees e
        LEFT JOIN departments d ON e.department = d.name
        ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registry fetch failed', error: err.message });
  }
};

// Fetch audit logs
const getLogs = async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Logs fetch failed', error: err.message });
  }
};

// Fetch system settings
const getSettings = async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM settings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Settings fetch failed', error: err.message });
  }
};

// Update system setting
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        await executeQuery('UPDATE settings SET value = ? WHERE key = ?', [value, key]);
        res.json({ success: true, message: 'Infrastructure updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Configuration update failed' });
    }
}

// Fetch active sessions
const getActiveSessions = async (req, res) => {
  try {
    const result = await executeQuery(`
        SELECT s.*, e.name, e.role, d.name as department_name 
        FROM sessions s
        JOIN employees e ON s.user_id = e.emp_id
        LEFT JOIN departments d ON e.department = d.name
        WHERE s.end_time IS NULL
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Session tracking failed', error: err.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id, role } = req.body;
        await executeQuery('UPDATE employees SET role = ? WHERE id = ?', [role, id]);
        // Also update users table for auth (Triggers handle this, but explicit update for safety)
        const empResult = await executeQuery('SELECT email FROM employees WHERE id = ?', [id]);
        if (empResult.rows[0]) {
            await executeQuery('UPDATE users SET role = ? WHERE email = ?', [role, empResult.rows[0].email]);
        }
        res.json({ success: true, message: 'Permissions escalated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Escalation failed' });
    }
}

// Mock backup
const backupData = async (req, res) => {
    res.json({ success: true, message: 'Enterprise Cloud Backup Snapshot Generated Successfully' });
}

// Get all data across entire organization
const getAllData = async (req, res) => {
  try {
    const [users, sess, brks, lvs, mtgs] = await Promise.all([
      executeQuery('SELECT id, emp_id, name, email, role FROM employees'),
      executeQuery('SELECT * FROM sessions'),
      executeQuery('SELECT * FROM breaks'),
      executeQuery('SELECT * FROM leaves'),
      executeQuery('SELECT * FROM meetings')
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows,
        sessions: sess.rows,
        breaks: brks.rows,
        leaves: lvs.rows.map(l => ({ ...l, name: users.rows.find(u => u.emp_id === l.emp_id)?.name || 'Unknown' })),
        meetings: mtgs.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching organizational data', error: err.message });
  }
};

module.exports = { 
    createUser, 
    updateUser, 
    deleteUser, 
    getAllData, 
    getUsers, 
    getLogs, 
    getSettings, 
    getActiveSessions,
    updateSetting,
    updateUserRole,
    backupData
};

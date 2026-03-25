const { db } = require('../db/db');
const { getLogs } = require('../db/logs');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, u.manager_id, 
             m.name as manager_name, d.name AS department_name, 
             e.salary, e.employee_code, e.department_id
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmployeeDetails = async (req, res) => {
    const { id, name, role, email, department_id, salary, manager_id } = req.body;
    const adminId = req.user.id;
    try {
        // Check old salary for history
        const oldResult = await db.execute({
            sql: 'SELECT salary FROM employees WHERE user_id = ?',
            args: [id]
        });
        const oldSalary = oldResult.rows[0]?.salary || 0;

        await db.execute({
            sql: 'UPDATE users SET name = ?, role = ?, email = ?, manager_id = ? WHERE id = ?',
            args: [name, role, email, manager_id, id]
        });
        await db.execute({
            sql: 'UPDATE employees SET name = ?, role = ?, department_id = ?, salary = ? WHERE user_id = ?',
            args: [name, role, department_id, salary, id]
        });

        if (salary !== oldSalary) {
            await db.execute({
                sql: 'INSERT INTO salary_history (user_id, old_salary, new_salary, updated_by) VALUES (?, ?, ?, ?)',
                args: [id, oldSalary, salary, adminId]
            });
        }

        res.json({ message: 'Employee details updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateUserRole = async (req, res) => {
  const { id, role } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE users SET role = ? WHERE id = ?',
      args: [role, id]
    });
    // Also update employees table if exists
    await db.execute({
        sql: 'UPDATE employees SET role = ? WHERE user_id = ?',
        args: [role, id]
    });
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute({ sql: 'DELETE FROM employees WHERE user_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM attendance WHERE user_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM breaks WHERE user_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM meetings WHERE user_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM leaves WHERE user_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalaryHistory = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT sh.*, u.name as employee_name, ub.name as updated_by_name
            FROM salary_history sh
            JOIN users u ON sh.user_id = u.id
            JOIN users ub ON sh.updated_by = ub.id
            ORDER BY sh.updated_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getSystemSettings = async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM system_settings');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  const { key, value } = req.body;
  try {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)',
      args: [key, value]
    });
    res.json({ message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const result = await db.execute(`
        SELECT d.name as role, AVG(u.productivity_score) as avg_work_duration 
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN users u ON e.user_id = u.id
        GROUP BY d.name
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.backupDatabase = (req, res) => {
  res.status(501).json({ message: 'Backup feature is now managed via Turso Dashboard' });
};

exports.getActiveSessions = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT u.id, u.name, u.role, a.login_time as start_time, d.name as department_name
            FROM users u 
            JOIN attendance a ON u.id = a.user_id 
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE a.logout_time IS NULL
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


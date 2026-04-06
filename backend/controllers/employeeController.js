const { client } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * getAllEmployees - Fetch all personnel records
 * Optimized for real-time dashboard reflection.
 */
exports.getAllEmployees = async (req, res) => {
    console.log('📡 API: GET /api/employees');
    try {
        const query = await client.execute("SELECT id, emp_id, name, email, role, department, joining_date, salary FROM employees ORDER BY created_at DESC");
        res.json({ success: true, employees: query.rows });
    } catch (err) {
        console.error('🔥 DB Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: Fetch failed' });
    }
};

/**
 * addEmployee - Create new personnel entry
 * Maps directly to users table for unified identity.
 */
exports.addEmployee = async (req, res) => {
    const { emp_id, name, email, password, role, department, joining_date, salary } = req.body;
    console.log(`📡 API: POST /api/employees - Enrollment: ${email}`);

    // Basic Input Validation
    if (!emp_id || !name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await client.execute({
            sql: "INSERT INTO employees (emp_id, name, email, password, role, department, joining_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [emp_id, name, email, hashedPassword, role || 'Employee', department || 'General', joining_date, salary || 0]
        });
        
        // Sync with users table for authentication
        await client.execute({
            sql: "INSERT OR IGNORE INTO users (email, password, role, emp_id, name) VALUES (?, ?, ?, ?, ?)",
            args: [email, hashedPassword, role || 'Employee', emp_id, name]
        });

        console.log(`✅ DB: Data persisted for ${emp_id}`);
        res.status(201).json({ success: true, message: 'Employee enrolled and synced', emp_id });
    } catch (err) {
        console.error('🔥 DB Insert Error:', err.message);
        res.status(400).json({ success: false, message: 'Database rejection: ' + err.message });
    }
};

/**
 * updateEmployee - Modify existing personnel metadata
 * Real-time sync with Turso.
 */
exports.updateEmployee = async (req, res) => {
    const { id } = req.params; // emp_id
    const { name, email, role, department, joining_date, salary, password } = req.body;
    console.log(`📡 API: PUT /api/employees/${id}`);

    try {
        // Get old email to update users table if email changed
        const oldDataResult = await client.execute({
            sql: "SELECT email FROM employees WHERE emp_id = ?",
            args: [id]
        });
        const oldEmail = oldDataResult.rows[0]?.email;

        let sql = "UPDATE employees SET name = ?, email = ?, role = ?, department = ?, joining_date = ?, salary = ?";
        let args = [name, email, role, department, joining_date, salary];
        
        if (password) {
            sql += ", password = ?";
            args.push(password);
        }
        
        sql += " WHERE emp_id = ?";
        args.push(id);
        
        await client.execute({ sql, args });

        // Sync with users table
        if (oldEmail) {
            let userSql = "UPDATE users SET email = ?, role = ?";
            let userArgs = [email, role];
            if (password) {
                userSql += ", password = ?";
                userArgs.push(password);
            }
            userSql += " WHERE email = ?";
            userArgs.push(oldEmail);
            await client.execute({ sql: userSql, args: userArgs });
        }

        console.log(`✅ DB: Record updated for ${id}`);
        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        console.error('🔥 DB Update Error:', err.message);
        res.status(500).json({ success: false, message: 'Modification failed' });
    }
};

/**
 * deleteEmployee - Permanently remove personnel entry
 */
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: DELETE /api/employees/${id}`);
    try {
        // Get email to delete from users table too
        const empResult = await client.execute({
            sql: "SELECT email FROM employees WHERE emp_id = ?",
            args: [id]
        });
        const empEmail = empResult.rows[0]?.email;

        await client.execute({
            sql: "DELETE FROM employees WHERE emp_id = ?",
            args: [id]
        });

        if (empEmail) {
            await client.execute({
                sql: "DELETE FROM users WHERE email = ?",
                args: [empEmail]
            });
        }

        console.log(`✅ DB: Record purged for ${id}`);
        res.json({ success: true, message: 'Employee deleted' });
    } catch (err) {
        console.error('🔥 DB Delete Error:', err.message);
        res.status(500).json({ success: false, message: 'Purge failed' });
    }
};

/**
 * getEmployeeById - Fetch single record
 */
exports.getEmployeeById = async (req, res) => {
    const { id } = req.params; // emp_id
    try {
        const query = await client.execute({
            sql: "SELECT emp_id, name, email, role, department, joining_date, salary FROM employees WHERE emp_id = ?",
            args: [id]
        });
        if (query.rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.json(query.rows[0]);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: Fetch failed' });
    }
};

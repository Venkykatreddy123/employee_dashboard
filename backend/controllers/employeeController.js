const { client } = require('../config/db');

/**
 * getAllEmployees - Fetch all personnel records
 * Optimized for real-time dashboard reflection.
 */
exports.getAllEmployees = async (req, res) => {
    console.log('📡 API: GET /api/employees');
    try {
        const query = await client.execute("SELECT id, emp_id, name, email, role, department, joining_date, salary FROM users ORDER BY created_at DESC");
        res.json(query.rows);
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
    console.log(`📡 API: POST /api/employees - ${email}`);

    // Basic Input Validation
    if (!emp_id || !name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        await client.execute({
            sql: "INSERT INTO users (emp_id, name, email, password, role, department, joining_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [emp_id, name, email, password, role || 'Employee', department || 'General', joining_date, salary || 0]
        });
        console.log(`✅ DB: Data persisted for ${emp_id}`);
        res.status(201).json({ success: true, message: 'Employee added successfully', emp_id });
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
        let sql = "UPDATE users SET name = ?, email = ?, role = ?, department = ?, joining_date = ?, salary = ?";
        let args = [name, email, role, department, joining_date, salary];
        
        if (password) {
            sql += ", password = ?";
            args.push(password);
        }
        
        sql += " WHERE emp_id = ?";
        args.push(id);
        
        await client.execute({ sql, args });
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
        await client.execute({
            sql: "DELETE FROM users WHERE emp_id = ?",
            args: [id]
        });
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
            sql: "SELECT emp_id, name, email, role, department, joining_date, salary FROM users WHERE emp_id = ?",
            args: [id]
        });
        if (query.rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.json(query.rows[0]);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: Fetch failed' });
    }
};

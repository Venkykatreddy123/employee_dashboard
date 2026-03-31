const jwt = require('jsonwebtoken');
const { client } = require('../config/db');

/**
 * login - Authenticates user and returns JWT
 * Identity Registry: employees table
 */
exports.login = async (req, res) => {
    try {
        console.log("LOGIN BODY:", req.body);
        const { email, password } = req.body;

        const result = await client.execute({
            sql: `
                SELECT u.id, u.email, u.password, u.role, e.emp_id 
                FROM users u 
                LEFT JOIN employees e ON u.email = e.email
                WHERE u.email = ? LIMIT 1
            `,
            args: [email]
        });

        const user = result.rows[0];

        if (!user) {
            console.warn(`❌ [AUTH] User not found: ${email}`);
            return res.status(401).json({ error: "User not found" });
        }

        // If using plain password as requested
        if (user.password !== password) {
            console.warn(`❌ [AUTH] Invalid password for: ${email}`);
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate JWT for app consistency
        const payload = {
            id: user.emp_id || user.id, // Prefer emp_id for database operations
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
            expiresIn: '24h'
        });

        console.log(`✅ Login success: ${user.email} (${user.role})`);
        
        // Return both structure requested by user and the token required by AuthContext
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * getMe - Returns current authenticated user profile
 */
exports.getMe = async (req, res) => {
    try {
        // Query by email which is consistent across both tables
        const query = await client.execute({
            sql: "SELECT emp_id, name, email, role, department, joining_date, salary FROM employees WHERE email = ? LIMIT 1",
            args: [req.user.email]
        });

        if (query.rows.length === 0) {
            console.warn(`⚠️ Profile not found in registry for: ${req.user.email}`);
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(query.rows[0]);
    } catch (err) {
        console.error('🔥 Get Profile Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * register - Create new user
 */
exports.register = async (req, res) => {
    const { emp_id, name, email, password, role, department } = req.body;
    try {
        await client.execute({
            sql: "INSERT INTO employees (emp_id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)",
            args: [emp_id, name, email, password, role || 'Employee', department || 'General']
        });
        
        // Sync with users table for authentication
        await client.execute({
            sql: "INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)",
            args: [email, password, role || 'Employee']
        });

        res.status(201).json({ message: 'User registered successfully and synced to auth registry.' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ message: err.message });
    }
};

/**
 * getUsers - List all system users
 */
exports.getUsers = async (req, res) => {
    try {
        const query = await client.execute("SELECT emp_id, name, email, role, department FROM employees");
        res.json(query.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

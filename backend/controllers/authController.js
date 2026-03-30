const jwt = require('jsonwebtoken');
const { client } = require('../config/db');

/**
 * login - Authenticates user and returns JWT
 * Identity Registry: employees table
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔐 [AUTH] Login Node Triggered: Candidate=${email}`);

    try {
        console.log(`🔍 [AUTH] Probing Registry for identity: ${email}`);
        const query = await client.execute({
            sql: "SELECT id, emp_id, name, email, password, role FROM employees WHERE email = ? LIMIT 1",
            args: [email]
        });

        if (query.rows.length === 0) {
            console.warn(`❌ [AUTH] Handshake Discontinuity: Identity not found for ${email}`);
            return res.status(400).json({ message: 'User not found' });
        }

        const user = query.rows[0];

        // Plain text comparison
        if (password !== user.password) {
            console.warn(`❌ [AUTH] Integrity Failure: Invalid credential hash for ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.emp_id,
            role: user.role,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
            expiresIn: '24h'
        });

        console.log(`✅ Login Successful: ${user.name} (${user.role})`);
        res.json({
            token,
            user: {
                emp_id: user.emp_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('🔥 Login Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * getMe - Returns current authenticated user profile
 */
exports.getMe = async (req, res) => {
    try {
        const query = await client.execute({
            sql: "SELECT emp_id, name, email, role, department, joining_date, salary FROM employees WHERE emp_id = ? LIMIT 1",
            args: [req.user.id]
        });

        if (query.rows.length === 0) {
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
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
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

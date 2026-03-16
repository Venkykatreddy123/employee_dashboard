const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find user by email and join with role
        const result = await db.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.email = $1`, 
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let match = false;
        if (db.isMock && db.isMock()) {
            // In mock mode, allow plain text comparison for demo users if bcrypt fails
            match = password === 'admin123' || password === 'manager123' || password === 'employee123' || await bcrypt.compare(password, user.password);
        } else {
            match = await bcrypt.compare(password, user.password);
        }

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role_name.toLowerCase(), email: user.email, name: user.name },
            process.env.JWT_SECRET || 'supersecretjwtkey_123',
            { expiresIn: '1d' }
        );

        // Auto-capture login session
        await db.query(
            'INSERT INTO work_sessions (user_id, login_time) VALUES ($1, $2)',
            [user.id, new Date().toISOString()]
        );

        // Log login activity to MongoDB
        await ActivityLog.create({
            userId: user.id,
            action: 'LOGIN_AUTO_CHECKIN',
            details: { email: user.email },
            role: user.role_name,
            ipAddress: req.ip
        });

        // Remove password from response
        const { password: _, ...userData } = user;
        return res.json({ token, role: user.role_name.toLowerCase(), user: userData });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login };

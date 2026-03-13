const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    
    // Check if it's admin first
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (admin) {
            const match = await bcrypt.compare(password, admin.password);
            if (!match) return res.status(401).json({ error: 'Invalid credentials' });
            
            const token = jwt.sign(
                { id: admin.id, role: 'admin', username: admin.username },
                process.env.JWT_SECRET || 'supersecretjwtkey_123',
                { expiresIn: '1d' }
            );
            return res.json({ token, role: 'admin', user: { username: admin.username } });
        }

        // Check if employee
        db.get('SELECT * FROM employees WHERE email = ?', [username], async (err, employee) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            if (!employee) return res.status(401).json({ error: 'Invalid credentials' });

            const match = await bcrypt.compare(password, employee.password);
            if (!match) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { id: employee.id, role: 'employee', email: employee.email, name: employee.name },
                process.env.JWT_SECRET || 'supersecretjwtkey_123',
                { expiresIn: '1d' }
            );
            return res.json({ token, role: 'employee', user: employee });
        });
    });
};

module.exports = { login };

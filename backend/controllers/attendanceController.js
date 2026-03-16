const db = require('../db');
const ActivityLog = require('../models/ActivityLog');

const checkIn = async (req, res) => {
    const user_id = req.user.role === 'admin' ? req.body.user_id : req.user.id;
    const login_time = new Date().toISOString();

    try {
        const result = await db.query(
            'INSERT INTO work_sessions (user_id, login_time) VALUES ($1, $2) RETURNING id',
            [user_id, login_time]
        );

        // Log to MongoDB
        await ActivityLog.create({
            userId: req.user.id,
            action: 'CHECK_IN',
            details: { target_user_id: user_id, session_id: result.rows[0].id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Checked in successfully' });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: err.message });
    }
};

const checkOut = async (req, res) => {
    const user_id = req.user.role === 'admin' ? req.body.user_id : req.user.id;
    const logout_time = new Date().toISOString();

    try {
        // Find latest active session
        const sessionResult = await db.query(
            'SELECT id, login_time FROM work_sessions WHERE user_id = $1 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
            [user_id]
        );

        const session = sessionResult.rows[0];
        if (!session) return res.status(400).json({ error: 'No active session found' });

        await db.query(
            'UPDATE work_sessions SET logout_time = $1 WHERE id = $2',
            [logout_time, session.id]
        );

        // Log to MongoDB
        await ActivityLog.create({
            userId: req.user.id,
            action: 'CHECK_OUT',
            details: { target_user_id: user_id, session_id: session.id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.json({ message: 'Checked out successfully' });
    } catch (err) {
        console.error('Check-out error:', err);
        res.status(500).json({ error: err.message });
    }
};

const manualLog = async (req, res) => {
    const { user_id, login_time, logout_time } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO work_sessions (user_id, login_time, logout_time, manual_adjustment) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, login_time, logout_time, true]
        );

        await ActivityLog.create({
            userId: req.user.id,
            action: 'MANUAL_LOG',
            details: { target_user_id: user_id, session_id: result.rows[0].id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Manual log created' });
    } catch (err) {
        console.error('Manual log error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getAttendance = async (req, res) => {
    const { role, id } = req.user;

    try {
        let query = `
            SELECT ws.*, u.name 
            FROM work_sessions ws 
            JOIN users u ON ws.user_id = u.id
        `;
        let params = [];

        if (role === 'employee') {
            query += ' WHERE ws.user_id = $1';
            params.push(id);
        } else if (role === 'manager') {
            query += ' WHERE u.manager_id = $1 OR ws.user_id = $1';
            params.push(id);
        }

        query += ' ORDER BY ws.login_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get attendance error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const updateIdleTime = async (req, res) => {
    const { idle_minutes } = req.body;
    const user_id = req.user.id;

    try {
        // Update the latest active session
        const result = await db.query(
            'UPDATE work_sessions SET idle_time = idle_time + $1 WHERE id = (SELECT id FROM work_sessions WHERE user_id = $2 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1) RETURNING id',
            [idle_minutes, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No active session found to update idle time' });
        }

        res.json({ message: 'Idle time updated', session_id: result.rows[0].id });
    } catch (err) {
        console.error('Update idle time error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { checkIn, checkOut, getAttendance, manualLog, updateIdleTime };

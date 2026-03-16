const db = require('../db');
const ActivityLog = require('../models/ActivityLog');

const startBreak = async (req, res) => {
    const { break_type } = req.body;
    const user_id = req.user.id;
    const start_time = new Date().toISOString();

    try {
        const result = await db.query(
            'INSERT INTO break_sessions (user_id, break_type, start_time) VALUES ($1, $2, $3) RETURNING id',
            [user_id, break_type, start_time]
        );

        await ActivityLog.create({
            userId: user_id,
            action: 'BREAK_START',
            details: { break_type, session_id: result.rows[0].id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Break started' });
    } catch (err) {
        console.error('Start break error:', err);
        res.status(500).json({ error: err.message });
    }
};

const endBreak = async (req, res) => {
    const user_id = req.user.id;
    const end_time = new Date().toISOString();

    try {
        const result = await db.query(
            'SELECT id, start_time FROM break_sessions WHERE user_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
            [user_id]
        );

        const session = result.rows[0];
        if (!session) return res.status(400).json({ error: 'No active break found' });

        const startTime = new Date(session.start_time);
        const endTime = new Date(end_time);
        const duration = (endTime - startTime) / (1000 * 60); // duration in minutes

        await db.query(
            'UPDATE break_sessions SET end_time = $1, duration = $2 WHERE id = $3',
            [end_time, duration, session.id]
        );

        await ActivityLog.create({
            userId: user_id,
            action: 'BREAK_END',
            details: { duration, session_id: session.id },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.json({ message: 'Break ended', duration });
    } catch (err) {
        console.error('End break error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getBreaks = async (req, res) => {
    const { id, role } = req.user;
    
    try {
        let query = `
            SELECT b.*, u.name 
            FROM break_sessions b 
            JOIN users u ON b.user_id = u.id
        `;
        let params = [];

        if (role === 'employee') {
            query += ' WHERE b.user_id = $1';
            params.push(id);
        } else if (role === 'manager') {
            query += ' WHERE u.manager_id = $1 OR b.user_id = $1';
            params.push(id);
        }

        query += ' ORDER BY b.start_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get breaks error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { startBreak, endBreak, getBreaks };

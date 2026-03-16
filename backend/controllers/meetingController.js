const db = require('../db');
const ActivityLog = require('../models/ActivityLog');

const logMeeting = async (req, res) => {
    const { meeting_type, title, start_time, end_time, notes } = req.body;
    const user_id = req.user.id;

    try {
        const result = await db.query(
            'INSERT INTO meetings (user_id, meeting_type, title, start_time, end_time, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [user_id, meeting_type, title, start_time, end_time, notes]
        );

        await ActivityLog.create({
            userId: user_id,
            action: 'LOG_MEETING',
            details: { title, meeting_type },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Meeting logged' });
    } catch (err) {
        console.error('Log meeting error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getMeetings = async (req, res) => {
    const { id, role } = req.user;

    try {
        let query = `
            SELECT m.*, u.name 
            FROM meetings m 
            JOIN users u ON m.user_id = u.id
        `;
        let params = [];

        if (role === 'employee') {
            query += ' WHERE m.user_id = $1';
            params.push(id);
        } else if (role === 'manager') {
            query += ' WHERE u.manager_id = $1 OR m.user_id = $1';
            params.push(id);
        }

        query += ' ORDER BY m.start_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get meetings error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { logMeeting, getMeetings };

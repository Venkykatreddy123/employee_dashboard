const db = require('../db');
const ActivityLog = require('../models/ActivityLog');

const applyLeave = async (req, res) => {
    const { leave_type, start_date, end_date, reason } = req.body;
    const user_id = req.user.id;

    try {
        const result = await db.query(
            'INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [user_id, leave_type, start_date, end_date, reason]
        );

        await ActivityLog.create({
            userId: user_id,
            action: 'APPLY_LEAVE',
            details: { leave_type, start_date, end_date },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Leave application submitted' });
    } catch (err) {
        console.error('Apply leave error:', err);
        res.status(500).json({ error: err.message });
    }
};

const approveLeave = async (req, res) => {
    const { id, status } = req.body; // status: Approved or Rejected
    const admin_id = req.user.id;

    try {
        await db.query(
            'UPDATE leaves SET status = $1, approved_by = $2 WHERE id = $3',
            [status, admin_id, id]
        );

        await ActivityLog.create({
            userId: admin_id,
            action: 'APPROVE_LEAVE',
            details: { leave_id: id, status },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.json({ message: `Leave ${status.toLowerCase()} successfully` });
    } catch (err) {
        console.error('Approve leave error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getLeaves = async (req, res) => {
    const { id, role } = req.user;

    try {
        let query = `
            SELECT l.*, u.name 
            FROM leaves l 
            JOIN users u ON l.user_id = u.id
        `;
        let params = [];

        if (role === 'employee') {
            query += ' WHERE l.user_id = $1';
            params.push(id);
        } else if (role === 'manager') {
            query += ' WHERE u.manager_id = $1 OR l.user_id = $1';
            params.push(id);
        }

        query += ' ORDER BY l.start_date DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get leaves error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { applyLeave, approveLeave, getLeaves };

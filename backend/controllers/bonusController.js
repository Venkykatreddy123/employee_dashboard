const db = require('../db');
const ActivityLog = require('../models/ActivityLog');

const assignBonus = async (req, res) => {
    const { employee_id, bonus_amount, bonus_reason, date_given } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO bonuses (employee_id, bonus_amount, bonus_reason, date_given) VALUES ($1, $2, $3, $4) RETURNING id',
            [employee_id, bonus_amount, bonus_reason, date_given]
        );

        await ActivityLog.create({
            userId: req.user.id,
            action: 'GIVE_BONUS',
            details: { employee_id, amount: bonus_amount },
            role: req.user.role,
            ipAddress: req.ip
        });

        res.status(201).json({ id: result.rows[0].id, message: 'Bonus recorded successfully' });
    } catch (err) {
        console.error('Give bonus error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getBonuses = async (req, res) => {
    const { id, role } = req.user;

    try {
        let query = 'SELECT b.*, u.name FROM bonuses b JOIN users u ON b.employee_id = u.id';
        let params = [];

        if (role === 'employee') {
            query += ' WHERE b.employee_id = $1';
            params.push(id);
        }

        query += ' ORDER BY b.date_given DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get bonuses error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { assignBonus, getBonuses };

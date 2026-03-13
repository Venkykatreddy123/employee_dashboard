const db = require('../db');

const assignBonus = (req, res) => {
    const { employee_id, bonus_amount, bonus_reason } = req.body;
    const date_given = new Date().toISOString().split('T')[0];

    db.run(
        'INSERT INTO bonuses (employee_id, bonus_amount, bonus_reason, date_given) VALUES (?, ?, ?, ?)',
        [employee_id, bonus_amount, bonus_reason, date_given],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Bonus assigned successfully' });
        }
    );
};

const getBonuses = (req, res) => {
    if (req.user.role === 'admin') {
        db.all(`
            SELECT b.*, e.name 
            FROM bonuses b 
            JOIN employees e ON b.employee_id = e.id
            ORDER BY b.date_given DESC
        `, [], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    } else {
        db.all('SELECT * FROM bonuses WHERE employee_id = ? ORDER BY date_given DESC', [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    }
};

module.exports = { assignBonus, getBonuses };

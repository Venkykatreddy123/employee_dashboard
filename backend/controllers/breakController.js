const db = require('../db');

const startBreak = (req, res) => {
    const { category } = req.body;
    const employee_id = req.user.role === 'admin' ? req.body.employee_id : req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString();

    db.run(
        'INSERT INTO breaks (employee_id, break_start, date, category) VALUES (?, ?, ?, ?)',
        [employee_id, time, date, category || 'Personal'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Break started successfully' });
        }
    );
};

const endBreak = (req, res) => {
    const employee_id = req.user.role === 'admin' ? req.body.employee_id : req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString();

    db.get(
        'SELECT id, break_start FROM breaks WHERE employee_id = ? AND date = ? AND break_end IS NULL',
        [employee_id, date],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!row) return res.status(400).json({ error: 'No active break found' });

            const start = new Date(row.break_start);
            const end = new Date(time);
            const duration = (end - start) / (1000 * 60); // minutes

            db.run(
                'UPDATE breaks SET break_end = ?, break_duration = ? WHERE id = ?',
                [time, duration, row.id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Break ended successfully', break_duration: duration });
                }
            );
        }
    );
};

const getBreaks = (req, res) => {
    const { role, id } = req.user;

    let query = `
        SELECT b.*, e.name 
        FROM breaks b 
        JOIN employees e ON b.employee_id = e.id
    `;
    let params = [];

    if (role === 'employee') {
        query += ' WHERE b.employee_id = ?';
        params.push(id);
    } else if (role === 'manager') {
        query += ' WHERE e.manager_id = ? OR b.employee_id = ?';
        params.push(id, id);
    }

    query += ' ORDER BY b.date DESC, b.break_start DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
}

module.exports = { startBreak, endBreak, getBreaks };

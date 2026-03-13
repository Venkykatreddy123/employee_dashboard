const db = require('../db');

const applyLeave = (req, res) => {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employee_id = req.user.id;

    db.run(
        'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
        [employee_id, leave_type, start_date, end_date, reason],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Leave application submitted successfully' });
        }
    );
};

const updateLeaveStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // e.g. Approved or Rejected

    db.run(
        'UPDATE leaves SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Leave ${status.toLowerCase()} successfully` });
        }
    );
};

const getLeaves = (req, res) => {
    if (req.user.role === 'admin') {
        db.all(`
            SELECT l.*, e.name 
            FROM leaves l 
            JOIN employees e ON l.employee_id = e.id
            ORDER BY l.start_date DESC
        `, [], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    } else {
        db.all('SELECT * FROM leaves WHERE employee_id = ? ORDER BY start_date DESC', [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    }
};

module.exports = { applyLeave, updateLeaveStatus, getLeaves };

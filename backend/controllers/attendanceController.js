const db = require('../db');

const checkIn = (req, res) => {
    // Allows admin to pass employee_id, otherwise use self
    const employee_id = req.user.role === 'admin' ? req.body.employee_id : req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString();

    db.run(
        'INSERT INTO attendance (employee_id, check_in, date) VALUES (?, ?, ?)',
        [employee_id, time, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Checked in successfully' });
        }
    );
};

const checkOut = (req, res) => {
    const employee_id = req.user.role === 'admin' ? req.body.employee_id : req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString();

    db.get(
        'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL',
        [employee_id, date],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!row) return res.status(400).json({ error: 'No active check-in found for today' });

            const checkInTime = new Date(row.check_in);
            const checkOutTime = new Date(time);
            const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

            db.run(
                'UPDATE attendance SET check_out = ?, work_hours = ? WHERE id = ?',
                [time, workHours, row.id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Checked out successfully', work_hours: workHours });
                }
            );
        }
    );
};

const manualLog = (req, res) => {
    const { employee_id, check_in, check_out, date } = req.body;
    
    // Calculate work hours
    const start = new Date(check_in);
    const end = new Date(check_out);
    const workHours = (end - start) / (1000 * 60 * 60);

    db.run(
        'INSERT INTO attendance (employee_id, check_in, check_out, work_hours, date, is_manual_override) VALUES (?, ?, ?, ?, ?, 1)',
        [employee_id, check_in, check_out, workHours, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Manual log created' });
        }
    );
};

const getAttendance = (req, res) => {
    const { role, id } = req.user;

    let query = `
        SELECT a.*, e.name 
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.id
    `;
    let params = [];

    if (role === 'employee') {
        query += ' WHERE a.employee_id = ?';
        params.push(id);
    } else if (role === 'manager') {
        query += ' WHERE e.manager_id = ? OR a.employee_id = ?';
        params.push(id, id);
    }

    query += ' ORDER BY a.date DESC, a.check_in DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
};

module.exports = { checkIn, checkOut, getAttendance, manualLog };

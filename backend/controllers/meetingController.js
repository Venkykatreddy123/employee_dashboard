const db = require('../db');

const logMeeting = (req, res) => {
    const { meeting_subject, start_time, classification } = req.body;
    const employee_id = req.user.id;
    const date = new Date().toISOString().split('T')[0];

    db.run(
        'INSERT INTO meetings (employee_id, meeting_subject, start_time, classification, date) VALUES (?, ?, ?, ?, ?)',
        [employee_id, meeting_subject, start_time, classification, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Meeting started' });
        }
    );
};

const endMeeting = (req, res) => {
    const employee_id = req.user.id;
    const end_time = new Date().toISOString();
    const date = new Date().toISOString().split('T')[0];

    db.get(
        'SELECT * FROM meetings WHERE employee_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
        [employee_id],
        (err, meeting) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!meeting) return res.status(400).json({ error: 'No active meeting found' });

            const start = new Date(meeting.start_time);
            const end = new Date(end_time);
            const duration = (end - start) / (1000 * 60 * 60); // hours

            db.run(
                'UPDATE meetings SET end_time = ?, duration = ? WHERE id = ?',
                [end_time, duration, meeting.id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Meeting ended', duration });
                }
            );
        }
    );
};

const getMeetings = (req, res) => {
    const { role, id } = req.user;

    let query = `
        SELECT m.*, e.name 
        FROM meetings m 
        JOIN employees e ON m.employee_id = e.id
    `;
    let params = [];

    if (role === 'employee') {
        query += ' WHERE m.employee_id = ?';
        params.push(id);
    } else if (role === 'manager') {
        // Managers see their team
        query += ' WHERE e.manager_id = ? OR m.employee_id = ?';
        params.push(id, id);
    }

    query += ' ORDER BY m.date DESC, m.start_time DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

module.exports = { logMeeting, endMeeting, getMeetings };

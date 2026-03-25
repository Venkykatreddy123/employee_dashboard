const { client } = require('../config/db');

/**
 * checkIn - Synchronized arrival for individual personnel
 */
exports.checkIn = async (req, res) => {
    const { emp_id } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`📡 API: POST /api/attendance/check-in (${emp_id})`);

    try {
        if (!emp_id) return res.status(400).json({ success: false, message: 'Digital ID required' });

        // Atomic check for existing pulse today
        const existing = await client.execute({
            sql: "SELECT id FROM attendance WHERE emp_id = ? AND date = ?",
            args: [emp_id, date]
        });

        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Already synchronized today' });
        }

        await client.execute({
            sql: "INSERT INTO attendance (emp_id, date, check_in, status) VALUES (?, ?, ?, ?)",
            args: [emp_id, date, time, 'Present']
        });

        res.status(201).json({ success: true, message: 'Pulse Synchronized', checkIn: time });
    } catch (err) {
        console.error('🔥 Attendance Check-In Failure:', err.message);
        res.status(500).json({ success: false, message: 'Operational pulse suspended' });
    }
};

/**
 * checkOut - Synchronized departure for individual personnel
 */
exports.checkOut = async (req, res) => {
    const { emp_id } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`📡 API: POST /api/attendance/check-out (${emp_id})`);

    try {
        if (!emp_id) return res.status(400).json({ success: false, message: 'Digital ID required' });

        const sync = await client.execute({
            sql: "UPDATE attendance SET check_out = ? WHERE emp_id = ? AND date = ? AND check_out IS NULL",
            args: [time, emp_id, date]
        });

        if (sync.rowsAffected === 0) {
            return res.status(400).json({ success: false, message: 'Active session not found' });
        }

        res.json({ success: true, message: 'Departure Synchronized', checkOut: time });
    } catch (err) {
        console.error('🔥 Attendance Check-Out Failure:', err.message);
        res.status(500).json({ success: false, message: 'Deactivation handshake failed' });
    }
};

/**
 * getMyHistory - Retrieve individual operational history
 */
exports.getMyHistory = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/attendance/my-history/${id}`);

    try {
        if (!id) return res.status(400).json({ success: false, message: 'Digital ID required' });

        const results = await client.execute({
            sql: "SELECT * FROM attendance WHERE emp_id = ? ORDER BY date DESC",
            args: [id]
        });

        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 History Fetch Failure:', err.message);
        res.status(500).json({ success: false, message: 'Operational history suspended' });
    }
};

/**
 * getAllAttendance - Organizational pulse monitoring (Admin Only)
 */
exports.getAllAttendance = async (req, res) => {
    console.log(`📡 API: GET /api/attendance/all`);
    try {
        const results = await client.execute(`
            SELECT a.*, u.name as employee_name, u.department 
            FROM attendance a
            JOIN users u ON a.emp_id = u.emp_id
            ORDER BY a.date DESC
        `);
        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 Global Pulse Fetch Failure:', err.message);
        res.status(500).json({ success: false, message: 'Organizational pulse suspended' });
    }
};

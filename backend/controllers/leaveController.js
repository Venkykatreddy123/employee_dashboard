const { client } = require('../config/db');

/**
 * requestLeave - Individual personnel lifecycle request (POST /api/leaves)
 */
exports.requestLeave = async (req, res) => {
    const { employee_id, from_date, to_date, reason } = req.body;
    console.log(`📡 [API POST/leaves] Request Body:`, JSON.stringify(req.body, null, 2));

    try {
        if (!employee_id) return res.status(400).json({ success: false, message: 'Employee ID required' });

        const result = await client.execute({
            sql: "INSERT INTO leaves (employee_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)",
            args: [employee_id, from_date, to_date, reason, 'Pending']
        });

        console.log(`✅ [DB INSERT Result]:`, result);

        // Real-Time Sync: Inform Admin Hub of New Registry
        if (req.io) {
            req.io.emit('leaveCreated', { employee_id, from_date, to_date, reason, status: 'Pending' });
            req.io.emit('dashboardUpdate');
            console.log('📡 [SOCKET] Broadcast: leaveCreated & dashboardUpdate');
        }

        res.status(201).json({ success: true, message: 'Leave Request Submitted Successfully' });
    } catch (err) {
        console.error('🔥 [Leave Request DB Error]:', err.message);
        res.status(500).json({ success: false, message: 'Internal registry error' });
    }
};

/**
 * getMyLeaves - Retrieve individual personnel lifecycle history (GET /api/leaves/my/:id)
 */
exports.getMyLeaves = async (req, res) => {
    const { id } = req.params; // employee_id
    console.log(`📡 [API GET/leaves/my/${id}]`);

    try {
        const results = await client.execute({
            sql: "SELECT * FROM leaves WHERE employee_id = ? ORDER BY from_date DESC",
            args: [id]
        });

        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 [Fetch My Leaves Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch personal leave history' });
    }
};

/**
 * getAllLeaves - Organizational lifecycle overview (GET /api/leaves)
 */
exports.getAllLeaves = async (req, res) => {
    console.log(`📡 [API GET /api/leaves]`);
    try {
        const results = await client.execute(`
            SELECT l.*, e.name as employee_name, e.department 
            FROM leaves l
            JOIN employees e ON l.employee_id = e.emp_id
            ORDER BY l.from_date DESC
        `);
        console.log(`📡 [GET API Response Send] Data count: ${results.rows.length}`);
        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 [Global Fetch Leaves Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch all leaves' });
    }
};

/**
 * updateLeaveStatus - Organizational tier decision (PUT /api/leaves/:id)
 */
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params; // ID from URL
    const { status } = req.body; // status from body
    console.log(`📡 [API PUT /api/leaves/${id}] Status -> ${status}`);

    try {
        if (!id || !status) return res.status(400).json({ success: false, message: 'ID and Status required' });

        await client.execute({
            sql: "UPDATE leaves SET status = ? WHERE id = ?",
            args: [status, id]
        });

        // Real-time Sync: Inform Hub of Registry Evolution
        if (req.io) {
            req.io.emit('leaveUpdated', { id, status });
            req.io.emit('dashboardUpdate');
            console.log('📡 [SOCKET] Broadcast: leaveUpdated & dashboardUpdate');
        }

        res.json({ success: true, message: `Leave Request ${status} Successfully` });
    } catch (err) {
        console.error('🔥 [Update Leave DB Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update leave status' });
    }
};

/**
 * deleteLeave - Admin delete leave (DELETE /api/leaves/:id)
 */
exports.deleteLeave = async (req, res) => {
    const { id } = req.params;
    console.log(`📡 [API DELETE /api/leaves/${id}]`);

    try {
        await client.execute({
            sql: "DELETE FROM leaves WHERE id = ?",
            args: [id]
        });

        // Real-time Sync: Inform Hub of Registry Reduction
        if (req.io) {
            req.io.emit('leaveDeleted', { id });
            req.io.emit('dashboardUpdate');
            console.log('📡 [SOCKET] Broadcast: leaveDeleted & dashboardUpdate');
        }

        res.json({ success: true, message: 'Leave Request Deleted Successfully' });
    } catch (err) {
        console.error('🔥 [Delete Leave DB Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to delete leave request' });
    }
};

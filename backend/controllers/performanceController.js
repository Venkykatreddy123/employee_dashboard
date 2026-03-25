const { client } = require('../config/db');

/**
 * getEmployeePerformance - Fetch historical metrics for individual personnel
 */
exports.getEmployeePerformance = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/performance/${id}`);
    try {
        const query = await client.execute({
            sql: "SELECT score, review_date, comments FROM performance WHERE emp_id = ? ORDER BY review_date DESC",
            args: [id]
        });
        
        // Return 200 with empty array if no data, to distinguish from server error
        res.json({ success: true, data: query.rows });
    } catch (err) {
        console.error('🔥 Performance Sync Error:', err.message);
        res.status(500).json({ success: false, message: 'Registry fetch suspended' });
    }
};

/**
 * addPerformanceRecord - Log new personnel review (Admin Only)
 */
exports.addPerformanceRecord = async (req, res) => {
    const { emp_id, score, review_date, comments } = req.body;
    try {
        await client.execute({
            sql: "INSERT INTO performance (emp_id, score, review_date, comments) VALUES (?, ?, ?, ?)",
            args: [emp_id, score, review_date, comments]
        });
        res.status(201).json({ success: true, message: 'Review persisted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Review storage failed' });
    }
};

import { db } from '../db.js';

// Helper for high-reliability data synchronization
const executeSafe = async (sqlObj) => {
    try {
        return await db.execute(sqlObj);
    } catch (err) {
        console.error(`[Query Error] Protocol failure for: ${typeof sqlObj === 'string' ? sqlObj : sqlObj.sql}`, err.message);
        return { rows: [], rowsAffected: 0 }; // Return empty set on failure
    }
};

export const getStats = async (req, res) => {
    const { role, id } = req.query;
    console.log(`[Dashboard Controller] Fetching stats. Role: ${role}, ID: ${id}`);

    try {
        if (role === 'employee') {
            const attRes = await executeSafe({ sql: "SELECT COUNT(*) as count FROM attendance WHERE user_id = ? AND date(check_in) = date('now')", args: [id] });
            const leaveRes = await executeSafe({ sql: "SELECT COUNT(*) as count FROM leaves WHERE user_id = ? AND status = 'Approved'", args: [id] });
            const bonusRes = await executeSafe({ sql: 'SELECT SUM(amount) as total FROM bonuses WHERE user_id = ?', args: [id] });
            const trendRes = await executeSafe({ sql: "SELECT date(check_in) as date, 8 as count FROM attendance WHERE user_id = ? ORDER BY check_in DESC LIMIT 7", args: [id] });
            const totalUserRes = await executeSafe('SELECT COUNT(*) as count FROM users');
            const mgrCountRes = await executeSafe("SELECT COUNT(*) as count FROM users WHERE role = 'manager'");
            const admCountRes = await executeSafe("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");

            const getCount = (res, key = 'count') => (res.rows && res.rows.length > 0 ? Number(res.rows[0][key] || 0) : 0);

            return res.status(200).json({
                summary: {
                    totalEmployees: getCount(totalUserRes),
                    presentToday: getCount(attRes),
                    onLeaveToday: getCount(leaveRes),
                    totalBonuses: getCount(bonusRes, 'total'),
                    managerCount: getCount(mgrCountRes),
                    adminCount: getCount(admCountRes),
                },
                attendanceStats: trendRes.rows ? [...trendRes.rows].reverse() : [],
                leaveStats: { 'Approved': getCount(leaveRes) }
            });
        }

        // Admin or Manager path - Sequential Execution for Stability
        const totalUserRes = await executeSafe('SELECT COUNT(*) as count FROM users');
        const presentRes = await executeSafe("SELECT COUNT(*) as count FROM attendance WHERE date(check_in) = date('now')");
        const leaveRes = await executeSafe("SELECT COUNT(*) as count FROM leaves WHERE date('now') BETWEEN date(from_date) AND date(to_date)");
        const bonusRes = await executeSafe('SELECT SUM(amount) as total FROM bonuses');
        const mgrCountRes = await executeSafe("SELECT COUNT(*) as count FROM users WHERE role = 'manager'");
        const admCountRes = await executeSafe("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const trendRes = await executeSafe('SELECT date(check_in) as date, COUNT(*) as count FROM attendance GROUP BY date(check_in) ORDER BY date DESC LIMIT 7');

        const getCount = (res, key = 'count') => (res.rows && res.rows.length > 0 ? Number(res.rows[0][key] || 0) : 0);

        res.status(200).json({
            summary: {
                totalEmployees: getCount(totalUserRes),
                presentToday: getCount(presentRes),
                onLeaveToday: getCount(leaveRes),
                totalBonuses: getCount(bonusRes, 'total'),
                managerCount: getCount(mgrCountRes),
                adminCount: getCount(admCountRes),
            },
            attendanceStats: trendRes.rows ? [...trendRes.rows].reverse() : [],
            leaveStats: { 'On Leave active': getCount(leaveRes) }
        });
    } catch (error) {
        console.error('[Dashboard Controller] ❌ Critical System Interruption:', error);
        res.status(500).json({ message: 'Internal Analytics Sync Error' });
    }
};

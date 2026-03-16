const db = require('../db');

const getDashboardStats = async (req, res) => {
    const { id, role } = req.user;

    try {
        // Basic metrics
        const empCount = await db.query('SELECT COUNT(*) FROM users');
        const activeSessions = await db.query('SELECT COUNT(DISTINCT user_id) FROM work_sessions WHERE logout_time IS NULL');
        
        // Calculate average productivity score
        const avgProductivity = await db.query('SELECT AVG(productivity_score) FROM users');

        // Recent activity (from MongoDB via ActivityLog model could be used, but database is fine for time tracking)
        const recentSessions = await db.query(
            'SELECT ws.*, u.name FROM work_sessions ws JOIN users u ON ws.user_id = u.id ORDER BY ws.login_time DESC LIMIT 5'
        );

        res.json({
            totalEmployees: parseInt(empCount.rows[0]?.count || 0),
            activeNow: parseInt(activeSessions.rows[0]?.count || 0),
            averageProductivity: parseFloat(avgProductivity.rows[0]?.avg || 0),
            recentActivity: recentSessions.rows || []
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const getProductivityAnalytics = async (req, res) => {
    const { id, role } = req.user;
    const targetUserId = req.query.user_id || id;

    try {
        // Formula: productivity_score = (work_time - idle_time - excessive_break_time) / work_time
        // We'll calculate this for the last 30 days
        
        const analytics = await db.query(`
            WITH daily_stats AS (
                SELECT 
                    DATE(login_time) as work_date,
                    SUM(EXTRACT(EPOCH FROM (COALESCE(logout_time, NOW()) - login_time)) / 3600) as total_work_hours,
                    SUM(COALESCE(idle_time, 0) / 60) as total_idle_hours
                FROM work_sessions 
                WHERE user_id = $1
                GROUP BY work_date
            ),
            daily_breaks AS (
                SELECT 
                    DATE(start_time) as break_date,
                    SUM(duration / 60) as total_break_hours
                FROM break_sessions 
                WHERE user_id = $1
                GROUP BY break_date
            )
            SELECT 
                ds.work_date,
                ds.total_work_hours,
                ds.total_idle_hours,
                COALESCE(db.total_break_hours, 0) as total_break_hours,
                -- Assuming excessive break time is anything over 1 hour (60 mins)
                GREATEST(0, COALESCE(db.total_break_hours, 0) - 1) as excessive_break_hours
            FROM daily_stats ds
            LEFT JOIN daily_breaks db ON ds.work_date = db.break_date
            ORDER BY ds.work_date DESC
            LIMIT 30
        `, [targetUserId]);

        const processed = analytics.rows.map(row => {
            const work = parseFloat(row.total_work_hours);
            const idle = parseFloat(row.total_idle_hours);
            const excessiveBreak = parseFloat(row.excessive_break_hours);
            
            const score = work > 0 ? ((work - idle - excessiveBreak) / work) * 100 : 0;

            return {
                date: row.work_date,
                workHours: work.toFixed(2),
                idleHours: idle.toFixed(2),
                breakHours: row.total_break_hours.toFixed(2),
                productivityScore: score.toFixed(2)
            };
        });

        res.json(processed);

    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getDashboardStats, getProductivityAnalytics };

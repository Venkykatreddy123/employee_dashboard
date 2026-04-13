const { db } = require('../config/db');
const { format } = require('date-fns');

const dashboardController = {
    // Get stats for dashboard
    getStats: async (req, res) => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            // Execute queries in parallel for better performance
            const [
                totalEmployeesRes,
                employeesPresentRes,
                pendingLeavesRes,
                pendingPayrollRes,
                totalWorkingHoursRes
            ] = await Promise.all([
                db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'Employee'"),
                db.execute("SELECT COUNT(DISTINCT user_id) as count FROM work_sessions WHERE session_date = ?", [today]),
                db.execute("SELECT COUNT(*) as count FROM leave_requests WHERE status IN ('Pending', 'pending')"),
                db.execute("SELECT COUNT(*) as count FROM payroll WHERE status = 'Unpaid'"),
                db.execute("SELECT SUM(total_duration) as total FROM work_sessions WHERE session_date = ?", [today])
            ]);

            const stats = {
                totalEmployees: Number(totalEmployeesRes.rows[0].count) || 0,
                employeesPresent: Number(employeesPresentRes.rows[0].count) || 0,
                pendingLeaves: Number(pendingLeavesRes.rows[0].count) || 0,
                pendingPayroll: Number(pendingPayrollRes.rows[0].count) || 0,
                totalWorkingHours: Math.round(((Number(totalWorkingHoursRes.rows[0].total) || 0) / 3600) * 10) / 10
            };

            res.status(200).json(stats);
        } catch (err) {
            console.error('Dashboard Stats Error:', err);
            res.status(500).json({ 
                message: 'Failed to retrieve dashboard analytics', 
                error: err.message,
                status: 'error'
            });
        }
    }
};

module.exports = dashboardController;

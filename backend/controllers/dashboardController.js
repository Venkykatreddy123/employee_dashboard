const { client } = require('../config/db');

/**
 * getDashboardStats - Global infrastructure metrics (Admin Only)
 */
exports.getDashboardStats = async (req, res) => {
    console.log('📡 API: GET /api/dashboard/admin - Global Metrics');
    try {
        const [empCount, projCount, salarySum] = await Promise.all([
            client.execute("SELECT COUNT(*) as count FROM employees"),
            client.execute("SELECT COUNT(*) as count FROM projects"),
            client.execute("SELECT SUM(salary) as total FROM employees")
        ]);

        res.json({
            totalEmployees: empCount.rows[0]?.count || 0,
            totalProjects: projCount.rows[0]?.count || 0,
            totalSalary: salarySum.rows[0]?.total || 0,
            syncStatus: 'Optimal'
        });
    } catch (err) {
        res.json({ totalEmployees: 0, totalProjects: 0, totalSalary: 0, syncStatus: 'Offline' });
    }
};

/**
 * getEmployeeStats - Filtered metrics for a single personnel (Employee Role)
 */
exports.getEmployeeStats = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/dashboard/employee/${id} - Filtered Metrics`);
    try {
        // Only count projects they are assigned to
        const projectsCount = await client.execute({
            sql: "SELECT COUNT(*) as count FROM project_assignments WHERE employee_id = ?",
            args: [id]
        });

        // Other personal metrics could be added here (attendance, leave status)
        res.json({
            totalProjects: projectsCount.rows[0]?.count || 0,
            syncStatus: 'Optimal'
        });
    } catch (err) {
        console.error('🔥 Filtered Sync Error:', err.message);
        res.json({ totalProjects: 0, syncStatus: 'Offline' });
    }
};

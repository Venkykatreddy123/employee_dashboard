const { client } = require('../config/db');

/**
 * createProject - Initialize a new project and assign employees
 */
exports.createProject = async (req, res) => {
    const { project_id, title, budget, start_date, end_date, status, tech_stack, assigned_employees } = req.body;
    console.log(`📡 API: POST /api/projects - ${title}`);

    try {
        await client.execute({
            sql: "INSERT INTO projects (project_id, title, budget, start_date, end_date, status, tech_stack) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [project_id, title, budget || 0, start_date, end_date, status || 'Active', tech_stack]
        });

        if (assigned_employees && assigned_employees.length > 0) {
            for (const empId of assigned_employees) {
                await client.execute({
                    sql: "INSERT INTO project_assignments (project_id, employee_id) VALUES (?, ?)",
                    args: [project_id, empId]
                });
            }
        }
        // 📡 Real-Time Hub Sync
        if (req.io) req.io.emit('dashboardUpdate');
        res.status(201).json({ success: true, message: 'Project initialized', project_id });
    } catch (err) {
        console.error('🔥 DB Insert Error:', err.message);
        res.status(400).json({ success: false, message: 'Sync failed: ' + err.message });
    }
};

/**
 * getAllProjects - Fetch all projects with relational personnel mapping (Admin/Manager/HR Only)
 */
exports.getAllProjects = async (req, res) => {
    console.log('📡 API: GET /api/projects');
    try {
        const projectsQuery = await client.execute("SELECT * FROM projects ORDER BY created_at DESC");
        const assignmentsQuery = await client.execute(`
            SELECT pa.project_id, e.emp_id, e.name 
            FROM project_assignments pa 
            JOIN employees e ON pa.employee_id = e.emp_id
        `);

        const projectMap = projectsQuery.rows.map(p => {
            const assigned = assignmentsQuery.rows.filter(a => a.project_id === p.project_id);
            return {
                ...p,
                assigned_employees: assigned
            };
        });

        res.json(projectMap);
    } catch (err) {
        console.error('🔥 Project Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Turso Cloud Fetch Failed' });
    }
};

/**
 * getProjectsByEmployee - Fetch ONLY projects assigned to a specific individual
 * Security: Enforced by individual ID scoping.
 */
exports.getProjectsByEmployee = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/projects/employee/${id}`);
    try {
        // Find project IDs assigned to this employee
        const projectsQuery = await client.execute({
            sql: "SELECT p.* FROM projects p JOIN project_assignments pa ON p.project_id = pa.project_id WHERE pa.employee_id = ? ORDER BY p.created_at DESC",
            args: [id]
        });
        
        // Fetch all assignments for these projects so the employee sees who they're working with
        const projectIds = projectsQuery.rows.map(p => p.project_id);
        let projectMap = projectsQuery.rows.map(p => ({ ...p, assigned_employees: [] }));
        
        if (projectIds.length > 0) {
            const placeholders = projectIds.map(() => '?').join(',');
            const assignmentsQuery = await client.execute({
                sql: `SELECT pa.project_id, e.emp_id, e.name 
                      FROM project_assignments pa 
                      JOIN employees e ON pa.employee_id = e.emp_id 
                      WHERE pa.project_id IN (${placeholders})`,
                args: projectIds
            });
            
            projectMap = projectsQuery.rows.map(p => {
                const assigned = assignmentsQuery.rows.filter(a => a.project_id === p.project_id);
                return { ...p, assigned_employees: assigned };
            });
        }
        res.json(projectMap);
    } catch (err) {
        console.error('🔥 RBAC Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Infrastructure Fetch Suspended' });
    }
};

/**
 * updateProject - Synchronize metadata and cross-reference assignments
 */
exports.updateProject = async (req, res) => {
    const { id } = req.params; // project_id
    const { title, budget, start_date, end_date, status, tech_stack, assigned_employees } = req.body;
    console.log(`📡 API: PUT /api/projects/${id}`);

    try {
        await client.execute({
            sql: "UPDATE projects SET title = ?, budget = ?, start_date = ?, end_date = ?, status = ?, tech_stack = ? WHERE project_id = ?",
            args: [title, budget, start_date, end_date, status, tech_stack, id]
        });

        await client.execute({ sql: "DELETE FROM project_assignments WHERE project_id = ?", args: [id] });
        if (assigned_employees && assigned_employees.length > 0) {
            for (const empId of assigned_employees) {
                await client.execute({
                    sql: "INSERT INTO project_assignments (project_id, employee_id) VALUES (?, ?)",
                    args: [id, empId]
                });
            }
        }
        // 📡 Real-Time Hub Sync
        if (req.io) req.io.emit('dashboardUpdate');
        res.json({ success: true, message: 'Portfolio updated' });
    } catch (err) {
        console.error('🔥 Update Error:', err.message);
        res.status(500).json({ success: false, message: 'Sync error' });
    }
};

/**
 * deleteProject - Purge infrastructure and relational data
 */
exports.deleteProject = async (req, res) => {
    const { id } = req.params; // project_id
    console.log(`📡 API: DELETE /api/projects/${id}`);
    try {
        await client.execute({ sql: "DELETE FROM projects WHERE project_id = ?", args: [id] });
        // 📡 Real-Time Hub Sync
        if (req.io) req.io.emit('dashboardUpdate');
        res.json({ success: true, message: 'Project decommissioned' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};

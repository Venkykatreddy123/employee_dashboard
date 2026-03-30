const { client: db } = require('../config/db');

// Create user (Maintaining consistent plain-text strategy of the project)
exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required!' });
    }

    try {
        console.log(`[Turso Controller] Provisioning registry for: ${email}`);
        const result = await db.execute({
            sql: 'INSERT INTO employees (name, email, password, emp_id) VALUES (?, ?, ?, ?)',
            args: [name, email, password, `EMP${Math.floor(Math.random()*10000)}`]
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully!',
            userId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        console.error('[Turso Controller] Provisioning Error:', err.message);
        res.status(500).json({ success: false, message: 'Error creating user', error: err.message });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        console.log('[Turso Controller] Extracting all identity records...');
        const result = await db.execute('SELECT id, emp_id, name, email, role FROM employees');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('[Turso Controller] Extraction Error:', err.message);
        res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
    }
};

// Add employee
exports.addEmployee = async (req, res) => {
    const { name, role, department } = req.body;

    if (!name || !role || !department) {
        return res.status(400).json({ success: false, message: 'Name, role, and department are required!' });
    }

    try {
        console.log(`[Turso Controller] Registering personnel: ${name}`);
        const result = await db.execute({
            sql: 'INSERT INTO employees (name, role, department, emp_id, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            args: [name, role, department, `EMP${Math.floor(Math.random()*10000)}`, `${name.toLowerCase().replace(/\s/g,'.')}@company.com`, 'temp123']
        });
        res.status(201).json({
            success: true,
            message: 'Employee added successfully!',
            employeeId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        console.error('[Turso Controller] Registry Error:', err.message);
        res.status(500).json({ success: false, message: 'Error adding employee', error: err.message });
    }
};

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM employees');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching employees', error: err.message });
    }
};

// Mark attendance (Corrected reference to employees.emp_id)
exports.markAttendance = async (req, res) => {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
        return res.status(400).json({ success: false, message: 'employeeId (emp_id), date, and status are required!' });
    }

    try {
        console.log(`[Turso Controller] Logging attendance event for: ${employeeId}`);
        const result = await db.execute({
            sql: 'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
            args: [employeeId, date, status]
        });
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully!',
            attendanceId: Number(result.lastInsertRowid)
        });
    } catch (err) {
        console.error('[Turso Controller] Attendance Sync Error:', err.message);
        res.status(500).json({ success: false, message: 'Error marking attendance', error: err.message });
    }
};

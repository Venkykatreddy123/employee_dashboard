const { client: db } = require('../config/db');

const User = {
    getAll: async () => {
        // Direct query for identity registry (employees table)
        const result = await db.execute('SELECT id, emp_id, name, email, role, department, joining_date, salary FROM employees');
        return result.rows;
    },

    getById: async (id) => {
        const result = await db.execute({
            sql: 'SELECT id, emp_id, name, email, role, department, joining_date, salary FROM employees WHERE id = ? OR emp_id = ? LIMIT 1',
            args: [id, id]
        });
        return result.rows[0];
    },

    create: async (data) => {
        // Identity provision with default values
        const result = await db.execute({
            sql: 'INSERT INTO employees (emp_id, name, email, password, role, department, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [
                data.emp_id || `EMP${Math.floor(Math.random()*10000)}`,
                data.name,
                data.email,
                data.password, // Plain text for now
                data.role || 'Employee',
                data.department || 'Engineering',
                data.salary || 0
            ]
        });
        return { id: Number(result.lastInsertRowid) };
    },

    update: async (id, data) => {
        // Sync existing registry values
        const result = await db.execute({
            sql: 'UPDATE employees SET name = ?, email = ?, role = ?, department = ?, salary = ? WHERE id = ? OR emp_id = ?',
            args: [data.name, data.email, data.role, data.department, data.salary, id, id]
        });
        return result.rowsAffected;
    },

    delete: async (id) => {
        const result = await db.execute({
            sql: 'DELETE FROM employees WHERE id = ? OR emp_id = ?',
            args: [id, id]
        });
        return result.rowsAffected;
    },

    getManagers: async () => {
        // Organizational Pulse check
        const result = await db.execute("SELECT emp_id, name FROM employees WHERE role = 'Manager'");
        return result.rows;
    }
};

module.exports = User;

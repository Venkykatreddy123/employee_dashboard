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
        const emp_id = data.emp_id || `EMP${Math.floor(Math.random()*10000)}`;
        // Identity provision with default values
        const result = await db.execute({
            sql: 'INSERT INTO employees (emp_id, name, email, password, role, department, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [
                emp_id,
                data.name,
                data.email,
                data.password, // Plain text for now
                data.role || 'Employee',
                data.department || 'Engineering',
                data.salary || 0
            ]
        });

        // Mirror in users table for authentication
        await db.execute({
            sql: 'INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
            args: [data.email, data.password, data.role || 'Employee']
        });

        return { id: Number(result.lastInsertRowid) };
    },

    update: async (id, data) => {
        // Get current identity data to update users table
        const oldResult = await db.execute({
            sql: 'SELECT email FROM employees WHERE id = ? OR emp_id = ? LIMIT 1',
            args: [id, id]
        });
        const oldEmail = oldResult.rows[0]?.email;

        // Sync existing registry values
        const result = await db.execute({
            sql: 'UPDATE employees SET name = ?, email = ?, role = ?, department = ?, salary = ? WHERE id = ? OR emp_id = ?',
            args: [data.name, data.email, data.role, data.department, data.salary, id, id]
        });

        if (oldEmail) {
            await db.execute({
                sql: 'UPDATE users SET email = ?, role = ? WHERE email = ?',
                args: [data.email, data.role, oldEmail]
            });
        }
        return result.rowsAffected;
    },

    delete: async (id) => {
        // Get registry email before purging
        const oldResult = await db.execute({
            sql: 'SELECT email FROM employees WHERE id = ? OR emp_id = ? LIMIT 1',
            args: [id, id]
        });
        const email = oldResult.rows[0]?.email;

        const result = await db.execute({
            sql: 'DELETE FROM employees WHERE id = ? OR emp_id = ?',
            args: [id, id]
        });

        if (email) {
            await db.execute({
                sql: 'DELETE FROM users WHERE email = ?',
                args: [email]
            });
        }
        return result.rowsAffected;
    },

    getManagers: async () => {
        // Organizational Pulse check
        const result = await db.execute("SELECT emp_id, name FROM employees WHERE role = 'Manager'");
        return result.rows;
    }
};

module.exports = User;

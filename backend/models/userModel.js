import { db } from '../db.js';

const User = {
    getAll: async () => {
        const result = await db.execute('SELECT id, name, email, role, created_at FROM users');
        return result.rows;
    },

    getById: async (id) => {
        const result = await db.execute({
            sql: 'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            args: [id]
        });
        return result.rows[0];
    },

    create: async (data) => {
        const result = await db.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: [data.name, data.email, data.password, data.role]
        });
        return { id: Number(result.lastInsertRowid) };
    },

    update: async (id, data) => {
        const result = await db.execute({
            sql: 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            args: [data.name, data.email, data.role, id]
        });
        return result.rowsAffected;
    },

    delete: async (id) => {
        const result = await db.execute({
            sql: 'DELETE FROM users WHERE id = ?',
            args: [id]
        });
        return result.rowsAffected;
    },

    getManagers: async () => {
        const result = await db.execute("SELECT id, name FROM users WHERE role = 'manager'");
        return result.rows;
    }
};

export default User;

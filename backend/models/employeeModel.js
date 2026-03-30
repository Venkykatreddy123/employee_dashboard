import { db } from '../db.js';
import bcrypt from 'bcryptjs';

const Employee = {
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
    // Left for backward compatibility, though route bypasses it now
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('password123', salt);
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
      args: [data.name, data.email, data.role, pwd]
    });
    return { id: Number(result.lastInsertRowid) };
  },

  update: async (id, data) => {
    await db.execute({
      sql: 'UPDATE users SET name=?, role=?, email=? WHERE id=?',
      args: [data.name, data.role, data.email, id]
    });
  },

  getManagers: async () => {
    const result = await db.execute('SELECT id, name FROM users WHERE role LIKE "%Manager%" OR role LIKE "%Admin%"');
    return result.rows;
  },
  
  delete: async (id) => {
    await db.execute({
      sql: 'DELETE FROM users WHERE id=?',
      args: [id]
    });
  },
};

export default Employee;

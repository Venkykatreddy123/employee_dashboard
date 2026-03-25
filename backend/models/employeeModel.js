const db = require('../db');
const bcrypt = require('bcryptjs');

const Employee = {
  getAll: async () => {
    const result = await db.execute('SELECT * FROM employees');
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM employees WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  create: async (data) => {
    const result = await db.execute({
      sql: 'INSERT INTO employees (name, role, department) VALUES (?, ?, ?)',
      args: [data.name, data.role, data.department]
    });
    return { id: Number(result.lastInsertRowid) };
  },

  update: async (id, data) => {
    await db.execute({
      sql: 'UPDATE employees SET name=?, role=?, department=? WHERE id=?',
      args: [data.name, data.role, data.department, id]
    });
  },

  getManagers: async () => {
    const result = await db.execute('SELECT id, name FROM employees WHERE role LIKE "%Manager%" OR role LIKE "%Admin%"');
    return result.rows;
  },
  
  delete: async (id) => {
    await db.execute({
      sql: 'DELETE FROM employees WHERE id=?',
      args: [id]
    });
  },
};

module.exports = Employee;

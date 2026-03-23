import { db } from '../db.js';

const Leave = {
  getAll: async () => {
    const result = await db.execute(`
      SELECT l.*, u.name as user_name 
      FROM leaves l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.from_date DESC
    `);
    return result.rows;
  },
  
  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM leaves WHERE user_id = ? ORDER BY from_date DESC',
      args: [user_id]
    });
    return result.rows;
  },

  apply: async (data) => {
    return await db.execute({
      sql: "INSERT INTO leaves (user_id, from_date, to_date, leave_type, reason, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      args: [data.user_id, data.from_date, data.to_date, data.leave_type, data.reason]
    });
  },
  
  updateStatus: async (id, status) => {
    return await db.execute({
      sql: 'UPDATE leaves SET status = ? WHERE id = ?',
      args: [status, id]
    });
  }
};

export default Leave;

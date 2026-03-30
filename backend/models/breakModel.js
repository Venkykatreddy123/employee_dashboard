import { db } from '../db.js';

const Break = {
  getAll: async () => {
    const result = await db.execute(`
      SELECT b.*, u.name as user_name 
      FROM breaks b 
      JOIN users u ON b.user_id = u.id 
      ORDER BY b.break_start DESC
    `);
    return result.rows;
  },
  
  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM breaks WHERE user_id = ? ORDER BY break_start DESC',
      args: [user_id]
    });
    return result.rows;
  },

  start: async (user_id, now, type = 'Short Break') => {
    return await db.execute({
      sql: 'INSERT INTO breaks (user_id, break_start, type) VALUES (?, ?, ?)',
      args: [user_id, now, type]
    });
  },
  
  stop: async (id, now) => {
    return await db.execute({
      sql: 'UPDATE breaks SET break_end = ? WHERE id = ?',
      args: [now, id]
    });
  },

  getActiveBreak: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM breaks WHERE user_id = ? AND break_end IS NULL',
      args: [user_id]
    });
    return result.rows[0];
  }
};

export default Break;

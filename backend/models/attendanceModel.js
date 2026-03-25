import { db } from '../db.js';

const Attendance = {
  getAll: async () => {
    const result = await db.execute(`
      SELECT a.*, u.name as user_name 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      ORDER BY a.check_in DESC
    `);
    return result.rows;
  },
  
  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM attendance WHERE user_id = ? ORDER BY check_in DESC',
      args: [user_id]
    });
    return result.rows;
  },

  checkIn: async (user_id, now) => {
    return await db.execute({
      sql: 'INSERT INTO attendance (user_id, check_in) VALUES (?, ?)',
      args: [user_id, now]
    });
  },
  
  checkOut: async (id, now) => {
    return await db.execute({
      sql: 'UPDATE attendance SET check_out = ? WHERE id = ?',
      args: [now, id]
    });
  },

  getActiveSession: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM attendance WHERE user_id = ? AND check_out IS NULL',
      args: [user_id]
    });
    return result.rows[0];
  }
};

export default Attendance;

import { db } from '../db.js';

const Bonus = {
  getAll: async () => {
    const result = await db.execute(`
      SELECT b.*, u.name as user_name 
      FROM bonuses b
      JOIN users u ON b.user_id = u.id 
      ORDER BY b.id DESC
    `);
    return result.rows;
  },

  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM bonuses WHERE user_id = ?',
      args: [user_id]
    });
    return result.rows;
  },

  assign: async (data) => {
    return await db.execute({
      sql: 'INSERT INTO bonuses (user_id, amount, reason) VALUES (?, ?, ?)',
      args: [data.user_id, data.amount, data.reason]
    });
  }
};

export default Bonus;

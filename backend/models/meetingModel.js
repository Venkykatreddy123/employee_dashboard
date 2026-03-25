import { db } from '../db.js';

const Meeting = {
  getAll: async () => {
    const result = await db.execute(`
      SELECT m.*, u.name as user_name 
      FROM meetings m 
      JOIN users u ON m.user_id = u.id 
      ORDER BY m.meeting_date DESC
    `);
    return result.rows;
  },
  
  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM meetings WHERE user_id = ? ORDER BY meeting_date DESC',
      args: [user_id]
    });
    return result.rows;
  },

  create: async (data) => {
    return await db.execute({
      sql: 'INSERT INTO meetings (user_id, title, meeting_date, duration, notes) VALUES (?, ?, ?, ?, ?)',
      args: [data.user_id, data.title, data.meeting_date, data.duration, data.notes]
    });
  },
};

export default Meeting;

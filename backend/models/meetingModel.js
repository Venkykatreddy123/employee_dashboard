const { client: db } = require('../config/db');

const Meeting = {
  getAll: async () => {
    // Joining with employees table since 'users' table is not present in our schema
    const result = await db.execute(`
      SELECT m.*, e.name as user_name 
      FROM meetings m 
      LEFT JOIN employees e ON m.user_id = e.emp_id 
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
    // Expected fields from frontend: user_id, title, meeting_date, duration, notes
    return await db.execute({
      sql: 'INSERT INTO meetings (user_id, title, meeting_date, duration, notes) VALUES (?, ?, ?, ?, ?)',
      args: [data.user_id, data.title, data.meeting_date, Number(data.duration) || 0, data.notes]
    });
  },

  getById: async (id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM meetings WHERE id = ? LIMIT 1',
      args: [id]
    });
    return result.rows[0];
  },

  update: async (id, data) => {
    return await db.execute({
      sql: 'UPDATE meetings SET title = ?, meeting_date = ?, duration = ?, notes = ?, user_id = ? WHERE id = ?',
      args: [data.title, data.meeting_date, Number(data.duration) || 0, data.notes, data.user_id, id]
    });
  },

  delete: async (id) => {
    return await db.execute({
      sql: 'DELETE FROM meetings WHERE id = ?',
      args: [id]
    });
  }
};

module.exports = Meeting;

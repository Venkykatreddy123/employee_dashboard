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
      args: [data.user_id, data.title, data.meeting_date, data.duration, data.notes]
    });
  },
};

module.exports = Meeting;

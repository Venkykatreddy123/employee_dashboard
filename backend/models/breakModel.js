const { client: db } = require('../config/db');

const Break = {
  getAll: async () => {
    // Joining with employees registry
    const result = await db.execute(`
      SELECT b.*, e.name as user_name 
      FROM breaks b 
      LEFT JOIN employees e ON b.user_id = e.emp_id 
      ORDER BY b.break_start DESC
    `);
    return result.rows;
  },
  
  getByUser: async (user_id) => {
    const result = await db.execute({
      sql: 'SELECT * FROM breaks WHERE user_id = ? ORDER BY b.break_start DESC',
      args: [user_id]
    });
    return result.rows;
  },

  start: async (user_id, now) => {
    // Record start of break session
    return await db.execute({
      sql: 'INSERT INTO breaks (user_id, break_start) VALUES (?, ?)',
      args: [user_id, now]
    });
  },
  
  end: async (id, now) => {
    // Terminal break session
    return await db.execute({
      sql: 'UPDATE breaks SET break_end = ? WHERE id = ?',
      args: [now, id]
    });
  },

  getActiveBreak: async (user_id) => {
    // Query for identity in active (open) break state
    const result = await db.execute({
      sql: 'SELECT * FROM breaks WHERE user_id = ? AND break_end IS NULL LIMIT 1',
      args: [user_id]
    });
    return result.rows[0];
  }
};

module.exports = Break;

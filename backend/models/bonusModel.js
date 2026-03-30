const { client: db } = require('../config/db');

const Bonus = {
  getAll: async () => {
    // Audit log for all financial incentives
    const result = await db.execute(`
      SELECT b.*, e.name as user_name 
      FROM bonuses b
      LEFT JOIN employees e ON b.user_id = e.emp_id 
      ORDER BY b.id DESC
    `);
    return result.rows;
  },

  getByUser: async (user_id) => {
    // Individual compensation history
    const result = await db.execute({
      sql: 'SELECT * FROM bonuses WHERE user_id = ? ORDER BY assigned_at DESC',
      args: [user_id]
    });
    return result.rows;
  },

  assign: async (data) => {
    // Provision new incentive
    return await db.execute({
      sql: 'INSERT INTO bonuses (user_id, amount, reason) VALUES (?, ?, ?)',
      args: [data.user_id, data.amount, data.reason]
    });
  }
};

module.exports = Bonus;

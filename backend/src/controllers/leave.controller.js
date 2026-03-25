const { db } = require('../db/db');
const { logActivity } = require('../db/logs');

exports.applyLeave = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate, reason } = req.body;
  try {
    // Get manager_id from user
    const userResult = await db.execute({
      sql: 'SELECT manager_id FROM users WHERE id = ?',
      args: [userId]
    });
    const managerId = userResult.rows[0]?.manager_id;

    const result = await db.execute({
      sql: 'INSERT INTO leaves (user_id, manager_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, managerId, startDate, endDate, reason, 'Pending']
    });
    const requestId = result.lastInsertRowid?.toString();
    await logActivity(userId, 'apply_leave', { requestId, startDate, endDate, managerId });
    res.json({ message: 'Leave application submitted', requestId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelLeave = async (req, res) => {
  const userId = req.user.id;
  const leaveId = req.params.id;
  try {
    const check = await db.execute({
      sql: 'SELECT * FROM leaves WHERE id = ? AND user_id = ? AND status = ?',
      args: [leaveId, userId, 'Pending']
    });
    if (check.rows.length === 0) {
      return res.status(400).json({ error: 'Leave request not found or cannot be cancelled' });
    }
    await db.execute({
      sql: "UPDATE leaves SET status = 'Cancelled' WHERE id = ?",
      args: [leaveId]
    });
    await logActivity(userId, 'cancel_leave', { leaveId });
    res.json({ message: 'Leave application cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPendingLeaves = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    let sql = "SELECT l.*, u.name as user_name FROM leaves l JOIN users u ON l.user_id = u.id WHERE l.status = 'Pending'";
    let args = [];
    
    if (role === 'manager') {
      sql += " AND l.manager_id = ?";
      args.push(userId);
    }
    // Admin gets all pending
    
    sql += " ORDER BY created_at DESC";
    
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamLeaves = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    let sql = "SELECT l.*, u.name as user_name FROM leaves l JOIN users u ON l.user_id = u.id";
    let args = [];
    
    if (role === 'manager') {
      sql += " WHERE l.manager_id = ?";
      args.push(userId);
    }
    
    sql += " ORDER BY created_at DESC";
    
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  const { id, status } = req.body; // status: Approved / Rejected
  const userId = req.user.id;
  try {
    await db.execute({
      sql: 'UPDATE leaves SET status = ? WHERE id = ?',
      args: [status, id]
    });
    await logActivity(userId, 'update_leave_status', { requestId: id, status });
    res.json({ message: `Leave application ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveBalances = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM leave_balances WHERE user_id = ?',
      args: [userId]
    });
    res.json(result.rows[0] || { sick_leave: 0, casual_leave: 0, earned_leave: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


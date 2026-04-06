const { client: db } = require('../config/db');

const Meeting = {
  /**
   * Create a new meeting and associate participants
   */
  create: async (data) => {
    const { id, title, description, meeting_link, scheduled_time, duration, created_by, participants } = data;
    
    // 1. Insert meeting
    await db.execute({
      sql: `INSERT INTO meetings (id, title, description, meeting_link, scheduled_time, duration, created_by, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      args: [id, title, description, meeting_link, scheduled_time, Number(duration), created_by]
    });

    // 2. Insert participants (including creator)
    if (participants && Array.isArray(participants)) {
      for (const p of participants) {
        await db.execute({
          sql: `INSERT INTO meeting_participants (meeting_id, employee_id, role) VALUES (?, ?, ?)`,
          args: [id, p.employee_id, p.role || 'employee']
        });
      }
    }

    return id;
  },

  getAll: async () => {
    const result = await db.execute(`
      SELECT m.*, e.name as creator_name,
        (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.id) as participant_count
      FROM meetings m 
      LEFT JOIN employees e ON m.created_by = e.emp_id 
      ORDER BY m.scheduled_time DESC
    `);
    return result.rows;
  },

  getByUser: async (employee_id) => {
    // Return meetings where user is either creator or participant
    const result = await db.execute({
      sql: `
        SELECT DISTINCT m.*, e.name as creator_name,
          (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.id) as participant_count
        FROM meetings m
        LEFT JOIN employees e ON m.created_by = e.emp_id
        LEFT JOIN meeting_participants p ON m.id = p.meeting_id
        WHERE m.created_by = ? OR p.employee_id = ?
        ORDER BY m.scheduled_time DESC`,
      args: [employee_id, employee_id]
    });
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.execute({
      sql: `SELECT m.*, e.name as creator_name FROM meetings m 
            LEFT JOIN employees e ON m.created_by = e.emp_id 
            WHERE m.id = ?`,
      args: [id]
    });
    return result.rows[0];
  },

  getParticipants: async (meeting_id) => {
    const result = await db.execute({
      sql: `SELECT p.*, e.name, e.designation, e.profile_image 
            FROM meeting_participants p
            JOIN employees e ON p.employee_id = e.emp_id
            WHERE p.meeting_id = ?`,
      args: [meeting_id]
    });
    return result.rows;
  },

  updateStatus: async (id, status) => {
    return await db.execute({
      sql: 'UPDATE meetings SET status = ? WHERE id = ?',
      args: [status, id]
    });
  },

  joinMeeting: async (meeting_id, employee_id) => {
    // Check if entry already exists, update joined_at
    const existing = await db.execute({
      sql: 'SELECT id FROM meeting_participants WHERE meeting_id = ? AND employee_id = ?',
      args: [meeting_id, employee_id]
    });

    if (existing.rows.length > 0) {
      return await db.execute({
        sql: 'UPDATE meeting_participants SET joined_at = CURRENT_TIMESTAMP, left_at = NULL WHERE meeting_id = ? AND employee_id = ?',
        args: [meeting_id, employee_id]
      });
    } else {
      return await db.execute({
        sql: 'INSERT INTO meeting_participants (meeting_id, employee_id, joined_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        args: [meeting_id, employee_id]
      });
    }
  },

  leaveMeeting: async (meeting_id, employee_id) => {
    return await db.execute({
      sql: 'UPDATE meeting_participants SET left_at = CURRENT_TIMESTAMP WHERE meeting_id = ? AND employee_id = ?',
      args: [meeting_id, employee_id]
    });
  },

  saveMessage: async (meeting_id, sender_id, message) => {
    return await db.execute({
      sql: 'INSERT INTO meeting_messages (meeting_id, sender_id, message) VALUES (?, ?, ?)',
      args: [meeting_id, sender_id, message]
    });
  },

  getMessages: async (meeting_id) => {
    const result = await db.execute({
      sql: `SELECT mm.*, e.name as sender_name 
            FROM meeting_messages mm
            JOIN employees e ON mm.sender_id = e.emp_id
            WHERE mm.meeting_id = ? 
            ORDER BY mm.timestamp ASC`,
      args: [meeting_id]
    });
    return result.rows;
  },

  delete: async (id) => {
    // Cascading deletes manually if not set up in schema
    await db.execute({ sql: 'DELETE FROM meeting_participants WHERE meeting_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM meeting_messages WHERE meeting_id = ?', args: [id] });
    return await db.execute({ sql: 'DELETE FROM meetings WHERE id = ?', args: [id] });
  }
};

module.exports = Meeting;

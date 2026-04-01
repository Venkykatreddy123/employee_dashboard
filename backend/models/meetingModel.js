import { db } from '../db.js';

const Meeting = {
  create: async (data, participantIds) => {
    // Start transaction for atomicity
    const transaction = await db.transaction("write");
    try {
      const now = new Date().toISOString();
      const res = await transaction.execute({
        sql: `INSERT INTO meetings (user_id, title, description, date, time, meeting_link, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          data.user_id, 
          data.title, 
          data.description, 
          data.date, 
          data.time, 
          data.meeting_link, 
          now
        ]
      });

      const meetingId = Number(res.lastInsertRowid);
      
      // Add participants
      for (const empId of participantIds) {
        await transaction.execute({
          sql: 'INSERT INTO meeting_participants (meeting_id, employee_id) VALUES (?, ?)',
          args: [meetingId, empId]
        });
      }

      await transaction.commit();
      return meetingId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getByManager: async (managerId) => {
    const result = await db.execute({
      sql: 'SELECT * FROM meetings WHERE user_id = ? ORDER BY date DESC, time DESC',
      args: [managerId]
    });
    return result.rows;
  },

  getByEmployee: async (employeeId) => {
    const result = await db.execute({
      sql: `SELECT m.*, u.name as manager_name
            FROM meetings m
            JOIN meeting_participants mp ON m.id = mp.meeting_id
            JOIN users u ON m.user_id = u.id
            WHERE mp.employee_id = ?
            ORDER BY m.date DESC, m.time DESC`,
      args: [employeeId]
    });
    return result.rows;
  },

  getParticipants: async (meetingId) => {
    const result = await db.execute({
      sql: `SELECT u.id, u.name, u.email 
            FROM users u
            JOIN meeting_participants mp ON u.id = mp.employee_id
            WHERE mp.meeting_id = ?`,
      args: [meetingId]
    });
    return result.rows;
  }
};

export default Meeting;

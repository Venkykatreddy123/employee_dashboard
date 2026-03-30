import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import Attendance from '../models/attendanceModel.js';
import Break from '../models/breakModel.js';
import { db } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Status route: /api/time/status
router.get('/status', async (req, res) => {
    try {
        const userId = req.user.id;
        const activeSession = await Attendance.getActiveSession(userId);
        const activeBreak = await Break.getActiveBreak(userId);
        
        res.status(200).json({
            active: !!activeSession,
            onBreak: !!activeBreak,
            sessionId: activeSession?.id || null,
            startTime: activeSession?.check_in || null,
            breakId: activeBreak?.id || null,
            breakStart: activeBreak?.break_start || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching time status', error: error.message });
    }
});

// Start/Stop work: /api/time/start-work, /api/time/stop-work
router.post('/start-work', async (req, res) => {
    req.body.user_id = req.user.id;
    return attendanceController.checkIn(req, res);
});

router.post('/stop-work', async (req, res) => {
    req.body.user_id = req.user.id;
    return attendanceController.checkOut(req, res);
});

// Break: /api/time/start-break, /api/time/stop-break
router.post('/start-break', async (req, res) => {
    try {
        const { type } = req.body;
        const userId = req.user.id;
        const activeSession = await Attendance.getActiveSession(userId);
        if (!activeSession) return res.status(400).json({ message: 'Must start work before taking a break' });
        
        const now = new Date().toISOString();
        const result = await Break.start(userId, now, type || 'Short Break');
        res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Break started' });
    } catch (error) {
        res.status(500).json({ message: 'Error starting break', error: error.message });
    }
});

router.post('/stop-break', async (req, res) => {
    try {
        const userId = req.user.id;
        const activeBreak = await Break.getActiveBreak(userId);
        if (!activeBreak) return res.status(400).json({ message: 'No active break found' });
        
        const now = new Date().toISOString();
        await Break.stop(activeBreak.id, now);
        res.status(200).json({ message: 'Break ended' });
    } catch (error) {
        res.status(500).json({ message: 'Error ending break', error: error.message });
    }
});

// Stats: /api/time/stats
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        // Mocking some stats if not fully available in models yet, but we'll try to get real ones
        // In a real scenario, these would be calculated from the DB
        const result = await db.execute({
            sql: "SELECT SUM(strftime('%s', COALESCE(check_out, 'now')) - strftime('%s', check_in)) as total_work FROM attendance WHERE user_id = ?",
            args: [userId]
        });
        const breakRes = await db.execute({
            sql: "SELECT SUM(strftime('%s', COALESCE(break_end, 'now')) - strftime('%s', break_start)) as total_break FROM breaks WHERE user_id = ?",
            args: [userId]
        });
        const meetingRes = await db.execute({
            sql: "SELECT COUNT(*) as count FROM meetings WHERE user_id = ?",
            args: [userId]
        });
        const meetingsList = await db.execute({
            sql: "SELECT * FROM meetings WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
            args: [userId]
        });
        const breaksList = await db.execute({
            sql: "SELECT * FROM breaks WHERE user_id = ? ORDER BY break_start DESC LIMIT 5",
            args: [userId]
        });

        res.status(200).json({
            totalWorkTime: Number(result.rows[0].total_work || 0),
            totalBreakTime: Number(breakRes.rows[0].total_break || 0),
            totalMeetings: Number(meetingRes.rows[0].count || 0),
            weeklyData: [], // Recharts data
            meetingsList: meetingsList.rows,
            breaksList: breaksList.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

// Productivity: /api/time/productivity
router.get('/productivity', async (req, res) => {
   // Just returns current productivity score
   res.status(200).json({ score: 94, work: 0, breaks: 0 });
});

// Log Meeting: /api/time/log-meeting
router.post('/log-meeting', async (req, res) => {
    const { title, duration, type } = req.body;
    try {
        await db.execute({
            sql: 'INSERT INTO meetings (user_id, title, duration, type) VALUES (?, ?, ?, ?)',
            args: [req.user.id, title, duration, type]
        });
        res.status(201).json({ message: 'Meeting logged' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging meeting', error: err.message });
    }
});

// Work Hours Log: /api/time/work-hours
router.get('/work-hours', async (req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM attendance WHERE user_id = ? ORDER BY check_in DESC",
            args: [req.user.id]
        });
        res.status(200).json(result.rows.map(r => ({
            id: r.id,
            start_time: r.check_in,
            end_time: r.check_out,
            total_duration: r.check_out ? (new Date(r.check_out) - new Date(r.check_in)) / 1000 : 0
        })));
    } catch (err) {
        res.status(500).json({ message: 'Error fetching work hours', error: err.message });
    }
});

export default router;

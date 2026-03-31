import Attendance from '../models/attendanceModel.js';

export const checkIn = async (req, res) => {
    const { role, id: authUserId } = req.user;
    const userId = (role === 'admin' || role === 'manager') ? (req.body.user_id || authUserId) : authUserId;

    try {
        const active = await Attendance.getActiveSession(userId);
        if (active) return res.status(400).json({ message: 'User already checked in' });

        const now = new Date().toISOString();
        const result = await Attendance.checkIn(userId, now);
        res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Check-in successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-in', error: error.message });
    }
};

export const checkOut = async (req, res) => {
    const { role, id: authUserId } = req.user;
    const userId = (role === 'admin' || role === 'manager') ? (req.body.user_id || authUserId) : authUserId;

    try {
        const active = await Attendance.getActiveSession(userId);
        if (!active) return res.status(400).json({ message: 'No active session found' });

        const now = new Date().toISOString();
        await Attendance.checkOut(active.id, now);
        res.status(200).json({ message: 'Check-out successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-out', error: error.message });
    }
};

export const getAllAttendance = async (req, res) => {
    // If admin/manager and id is provided, fetch for target, otherwise fetch for self
    const { id } = req.query;
    const { role, id: authUserId } = req.user;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager') && !id) {
            result = await Attendance.getAll();
        } else {
            const targetId = id || authUserId;
            result = await Attendance.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

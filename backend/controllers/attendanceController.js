import Attendance from '../models/attendanceModel.js';

export const checkIn = async (req, res) => {
    const { user_id } = req.body;
    try {
        const active = await Attendance.getActiveSession(user_id);
        if (active) return res.status(400).json({ message: 'User already checked in' });

        const now = new Date().toISOString();
        const result = await Attendance.checkIn(user_id, now);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Check-in successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-in', error: error.message });
    }
};

export const checkOut = async (req, res) => {
    const { user_id } = req.body;
    try {
        const active = await Attendance.getActiveSession(user_id);
        if (!active) return res.status(400).json({ message: 'No active session found' });

        const now = new Date().toISOString();
        await Attendance.checkOut(active.id, now);
        res.status(200).json({ message: 'Check-out successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-out', error: error.message });
    }
};

export const getAllAttendance = async (req, res) => {
    const { user_id, id, role } = req.query;
    const targetId = id || user_id;
    
    try {
        let result;
        // If admin/manager and no specific target, get all.
        if ((role === 'admin' || role === 'manager') && (!id || id === '')) {
            result = await Attendance.getAll();
        } else {
            result = await Attendance.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

import Meeting from '../models/meetingModel.js';

export const createMeeting = async (req, res) => {
    try {
        await Meeting.create(req.body);
        res.status(201).json({ message: 'Meeting scheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
};

export const getMeetings = async (req, res) => {
    const { user_id, id, role } = req.query;
    const targetId = id || user_id;
    
    try {
        const result = targetId ? await Meeting.getByUser(targetId) : await Meeting.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};

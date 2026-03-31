import Meeting from '../models/meetingModel.js';

export const createMeeting = async (req, res) => {
    try {
        const meetingData = { ...req.body, user_id: req.user.id };
        await Meeting.create(meetingData);
        res.status(201).json({ message: 'Meeting scheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
};

export const getMeetings = async (req, res) => {
    const { id } = req.query;
    const { role, id: authUserId } = req.user;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager') && !id) {
            result = await Meeting.getAll();
        } else {
            const targetId = id || authUserId;
            result = await Meeting.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};

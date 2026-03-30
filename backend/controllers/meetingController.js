const Meeting = require('../models/meetingModel');

const createMeeting = async (req, res) => {
    try {
        console.log('[Meeting Controller] Recording new engagement session:', req.body.title);
        await Meeting.create(req.body);
        res.status(201).json({ success: true, message: 'Engagement session logged' });
    } catch (error) {
        console.error('[Meeting Controller] Error recording session:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const getMeetings = async (req, res) => {
    const { user_id, id } = req.query;
    const targetId = id || user_id;
    
    try {
        console.log(`[Meeting Controller] Extracting records for user: ${targetId || 'GLOBAL DATABASE'}`);
        const result = targetId ? await Meeting.getByUser(targetId) : await Meeting.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error('[Meeting Controller] Retrieval Failure:', error.message);
        res.status(500).json({ success: false, message: 'Retrieval Failure', error: error.message });
    }
};

module.exports = { createMeeting, getMeetings };

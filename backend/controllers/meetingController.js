import Meeting from '../models/meetingModel.js';
import crypto from 'crypto';

export const createMeeting = async (req, res) => {
    let { title, description, date, time, participants, meeting_link } = req.body;
    const { id: managerId } = req.user;

    try {
        if (!title || !date || !time) return res.status(400).json({ message: 'Title, date, and time are required' });
        
        // Ensure meeting_link is valid or generate fallback
        if (!meeting_link || !meeting_link.startsWith('http')) {
            meeting_link = 'https://meet.google.com/new';
        }

        const meetingData = { 
            user_id: managerId, 
            title, 
            description: description || '', 
            date, 
            time, 
            meeting_link 
        };

        const participantIds = Array.isArray(participants) ? participants : [];
        const meetingId = await Meeting.create(meetingData, participantIds);

        res.status(201).json({ 
            id: meetingId, 
            meeting_link, 
            message: 'Protocol established. Meeting sync link initialized.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
};

export const getManagerMeetings = async (req, res) => {
    const { id: managerId } = req.user;
    try {
        const meetings = await Meeting.getByManager(managerId);
        // For each meeting, optionally fetch participants
        const detailedMeetings = await Promise.all(meetings.map(async (m) => {
            const parts = await Meeting.getParticipants(m.id);
            return { 
                ...m, 
                participants: parts,
                id: Number(m.id) // LibSql BigInt conversion to secure Number
            };
        }));
        res.status(200).json(detailedMeetings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager meetings', error: error.message });
    }
};

export const getEmployeeMeetings = async (req, res) => {
    const { id: employeeId } = req.user;
    try {
        const meetings = await Meeting.getByEmployee(employeeId);
        const results = meetings.map(m => ({
            ...m,
            id: Number(m.id)
        }));
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assigned meetings', error: error.message });
    }
};

const Meeting = require('../models/meetingModel');

const createMeeting = async (req, res) => {
    try {
        const { title, description, scheduled_time, duration, created_by, participants, meeting_link } = req.body;
        
        // Validation Check
        if (!title || !scheduled_time || !created_by) {
            return res.status(400).json({ success: false, message: 'Missing required sync parameters' });
        }

        const meeting_id = `meet_${Math.random().toString(36).substr(2, 9)}`; 
        
        console.log('[Meeting Controller] Establishing session:', title);
        
        // Handle Meeting Link (Manual or Auto-gen)
        const finalLink = meeting_link && meeting_link.trim() !== '' 
            ? meeting_link 
            : `${req.protocol}://${req.get('host')}/meetings/${meeting_id}`;

        // Ensure participants include creator
        const allParticipants = [...(participants || [])];
        if (!allParticipants.find(p => p.employee_id === created_by)) {
          allParticipants.push({ employee_id: created_by, role: 'admin' });
        }

        const data = {
          id: meeting_id,
          title,
          description,
          meeting_link: finalLink,
          scheduled_time,
          duration: Number(duration) || 0,
          created_by,
          participants: allParticipants
        };

        await Meeting.create(data);
        
        // Broadcast new meeting creation to all connected nodes
        if (req.broadcastMeetingCreated) {
          req.broadcastMeetingCreated({ ...data, creator_name: req.user?.name || 'Admin Node' });
        }
        
        res.status(201).json({ 
          success: true, 
          message: 'Registry session established',
          meeting_id: meeting_id,
          meeting_link: finalLink
        });
    } catch (error) {
        console.error('[Meeting Controller] Creation Error:', error.message);
        res.status(500).json({ success: false, message: 'Infrastructure Sync Delay', error: error.message });
    }
};

const joinByLink = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { employee_id } = req.body;
        
        if (!meeting_id || !employee_id) {
            return res.status(400).json({ success: false, message: 'Identity parameters missing for handshake' });
        }

        console.log(`[Meeting Controller] Direct join protocol for ${employee_id} -> ${meeting_id}`);
        
        const meeting = await Meeting.getById(meeting_id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Strategic terminal offline: Meeting not found' });
        }

        // Join logic: Automatically adds participant if not on the authorized list (Task 5: Auto-add)
        await Meeting.joinMeeting(meeting_id, employee_id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Handshake complete. Node authorized.',
            meeting_id: meeting_id,
            data: meeting
        });
    } catch (error) {
        console.error('[Meeting Controller] Join Link Error:', error.message);
        res.status(500).json({ success: false, message: 'Strategic protocol association failure' });
    }
};

const getMeetings = async (req, res) => {
    const { employee_id } = req.params;
    try {
        console.log(`[Meeting Controller] Extracting records for employee: ${employee_id || 'GLOBAL REGISTRY'}`);
        const result = employee_id ? await Meeting.getByUser(employee_id) : await Meeting.getAll();
        res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error) {
        console.error('[Meeting Controller] Retrieval Failure:', error.message);
        res.status(500).json({ success: false, message: 'Cloud Connectivity Error', error: error.message });
    }
};

const getMeetingById = async (req, res) => {
    const { id } = req.params;
    try {
        const meeting = await Meeting.getById(id);
        if (!meeting) return res.status(404).json({ success: false, message: 'Session terminal not found' });
        
        const participants = await Meeting.getParticipants(id);
        const messages = await Meeting.getMessages(id);
        
        res.status(200).json({ success: true, data: { ...meeting, participants, messages } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Handshake error' });
    }
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await Meeting.updateStatus(id, status);
        res.status(200).json({ success: true, message: `Session status transitioned to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Status drift error' });
    }
};

const joinMeeting = async (req, res) => {
    const { meeting_id, employee_id } = req.body;
    try {
        await Meeting.joinMeeting(meeting_id, employee_id);
        res.status(200).json({ success: true, message: 'Node joined session' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Link association failure' });
    }
};

const leaveMeeting = async (req, res) => {
    const { meeting_id, employee_id } = req.body;
    try {
        await Meeting.leaveMeeting(meeting_id, employee_id);
        res.status(200).json({ success: true, message: 'Node disconnected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Disconnection tracking failure' });
    }
};

const getMessages = async (req, res) => {
    const { meeting_id } = req.params;
    try {
        const messages = await Meeting.getMessages(meeting_id);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Message retrieval failure' });
    }
};

const deleteMeeting = async (req, res) => {
    const { id } = req.params;
    try {
        await Meeting.delete(id);
        res.status(200).json({ success: true, message: 'Protocol record purged' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Decommissioning failure' });
    }
};

module.exports = { 
  createMeeting, 
  getMeetings, 
  getMeetingById,
  updateStatus, 
  joinMeeting, 
  leaveMeeting, 
  joinByLink,
  getMessages,
  deleteMeeting 
};

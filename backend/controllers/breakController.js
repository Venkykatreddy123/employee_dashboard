const Break = require('../models/breakModel');

const startBreak = async (req, res) => {
    const { user_id } = req.body;
    try {
        console.log(`[Break Controller] Starting timer for worker: ${user_id}`);
        const active = await Break.getActiveBreak(user_id);
        if (active) return res.status(400).json({ success: false, message: 'Identity already in break state' });

        const now = new Date().toISOString();
        await Break.start(user_id, now);
        res.status(201).json({ success: true, message: 'Break period initiated' });
    } catch (error) {
        console.error('[Break Controller] Start Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const endBreak = async (req, res) => {
    const { user_id } = req.body;
    try {
        console.log(`[Break Controller] Terminating timer for worker: ${user_id}`);
        const active = await Break.getActiveBreak(user_id);
        if (!active) return res.status(400).json({ success: false, message: 'No active break state detected' });

        const now = new Date().toISOString();
        await Break.end(active.id, now);
        res.status(200).json({ success: true, message: 'Break period concluded' });
    } catch (error) {
        console.error('[Break Controller] End Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const getBreaks = async (req, res) => {
    const { user_id, id, role } = req.query;
    const targetId = id || user_id;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager' || role === 'Admin' || role === 'Manager') && (!targetId)) {
            console.log('[Break Controller] Extracting global workforce break data');
            result = await Break.getAll();
        } else {
            console.log(`[Break Controller] Fetching break history for: ${targetId}`);
            result = await Break.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('[Break Controller] Retrieval Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

module.exports = { startBreak, endBreak, getBreaks };

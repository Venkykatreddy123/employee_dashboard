import Break from '../models/breakModel.js';

export const startBreak = async (req, res) => {
    const { user_id } = req.body;
    try {
        const active = await Break.getActiveBreak(user_id);
        if (active) return res.status(400).json({ message: 'User already on break' });

        const now = new Date().toISOString();
        await Break.start(user_id, now);
        res.status(201).json({ message: 'Break started' });
    } catch (error) {
        res.status(500).json({ message: 'Error starting break', error: error.message });
    }
};

export const endBreak = async (req, res) => {
    const { user_id } = req.body;
    try {
        const active = await Break.getActiveBreak(user_id);
        if (!active) return res.status(400).json({ message: 'No active break found' });

        const now = new Date().toISOString();
        await Break.end(active.id, now);
        res.status(200).json({ message: 'Break ended' });
    } catch (error) {
        res.status(500).json({ message: 'Error ending break', error: error.message });
    }
};

export const getBreaks = async (req, res) => {
    const { user_id, id, role } = req.query;
    const targetId = id || user_id;
    
    try {
        let result;
        // If admin/manager and no specific target, get all.
        if ((role === 'admin' || role === 'manager') && (!id || id === '')) {
            result = await Break.getAll();
        } else {
            result = await Break.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching breaks', error: error.message });
    }
};

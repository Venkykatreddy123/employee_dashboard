import Break from '../models/breakModel.js';

export const startBreak = async (req, res) => {
    const { role, id: authUserId } = req.user;
    const userId = (role === 'admin' || role === 'manager') ? (req.body.user_id || authUserId) : authUserId;

    try {
        const active = await Break.getActiveBreak(userId);
        if (active) return res.status(400).json({ message: 'User already on break' });

        const now = new Date().toISOString();
        const result = await Break.start(userId, now);
        res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Rest cycle initiated' });
    } catch (error) {
        res.status(500).json({ message: 'Error starting break', error: error.message });
    }
};

export const endBreak = async (req, res) => {
    const { role, id: authUserId } = req.user;
    const userId = (role === 'admin' || role === 'manager') ? (req.body.user_id || authUserId) : authUserId;

    try {
        const active = await Break.getActiveBreak(userId);
        if (!active) return res.status(400).json({ message: 'No active rest cycle found' });

        const now = new Date().toISOString();
        await Break.stop(active.id, now);
        res.status(200).json({ message: 'Rest cycle concluded' });
    } catch (error) {
        res.status(500).json({ message: 'Error ending break', error: error.message });
    }
};

export const getBreaks = async (req, res) => {
    const { id } = req.query;
    const { role, id: authUserId } = req.user;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager') && !id) {
            result = await Break.getAll();
        } else {
            const targetId = id || authUserId;
            result = await Break.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching breaks', error: error.message });
    }
};

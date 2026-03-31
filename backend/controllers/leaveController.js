import Leave from '../models/leaveModel.js';

export const applyLeave = async (req, res) => {
    try {
        const leaveData = { ...req.body, user_id: req.user.id };
        await Leave.apply(leaveData);
        res.status(201).json({ message: 'Leave application submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for leave', error: error.message });
    }
};

export const getLeaves = async (req, res) => {
    const { id } = req.query;
    const { role, id: authUserId } = req.user;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager') && !id) {
            result = await Leave.getAll();
        } else {
            const targetId = id || authUserId;
            result = await Leave.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await Leave.updateStatus(id, status);
        res.status(200).json({ message: 'Leave status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
};

export const getPendingLeaves = async (req, res) => {
    try {
        const all = await Leave.getAll();
        const pending = all.filter(l => l.status === 'pending');
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending leaves', error: error.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    const { id, status } = req.body;
    try {
        await Leave.updateStatus(id, status);
        res.status(200).json({ message: 'Leave status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
};

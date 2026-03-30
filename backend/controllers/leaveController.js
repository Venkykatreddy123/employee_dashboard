import Leave from '../models/leaveModel.js';

export const applyLeave = async (req, res) => {
    try {
        await Leave.apply(req.body);
        res.status(201).json({ message: 'Leave application submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for leave', error: error.message });
    }
};

export const getLeaves = async (req, res) => {
    const { user_id, id, role } = req.query;
    const targetId = id || user_id;
    
    try {
        let result;
        // If admin/manager and no specific target, get all. 
        // Note: targetId is usually provided by the frontend as the requester's ID.
        // We should allow all if the requester is an admin and didn't specify a different target.
        if ((role === 'admin' || role === 'manager') && (!id || id === '')) {
            result = await Leave.getAll();
        } else {
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

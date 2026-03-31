import Bonus from '../models/bonusModel.js';

export const assignBonus = async (req, res) => {
    try {
        // Bonus assignment is typically done by admin/manager, but we use the body for the target employee
        await Bonus.assign(req.body);
        res.status(201).json({ message: 'Bonus assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning bonus', error: error.message });
    }
};

export const getBonuses = async (req, res) => {
    const { id } = req.query;
    const { role, id: authUserId } = req.user;
    
    try {
        let result;
        if ((role === 'admin' || role === 'manager') && !id) {
            result = await Bonus.getAll();
        } else {
            const targetId = id || authUserId;
            result = await Bonus.getByUser(targetId);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bonuses', error: error.message });
    }
};

const Bonus = require('../models/bonusModel');

const assignBonus = async (req, res) => {
    try {
        console.log(`[Bonus Controller] Financial Registry: Assigning incentive to ${req.body.user_id}`);
        await Bonus.assign(req.body);
        res.status(201).json({ success: true, message: 'Incentive provisioned successfully' });
    } catch (error) {
        console.error('[Bonus Controller] Provisioning Error:', error.message);
        res.status(500).json({ success: false, message: 'Registry Failure', error: error.message });
    }
};

const getBonuses = async (req, res) => {
    const { user_id, id } = req.query;
    const targetId = id || user_id;
    
    try {
        console.log(`[Bonus Controller] Extracting compensation records: Target=${targetId || 'GLOBAL'}`);
        const result = targetId ? await Bonus.getByUser(targetId) : await Bonus.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error('[Bonus Controller] Retrieval Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

module.exports = { assignBonus, getBonuses };

const User = require('../models/userModel');

const getAllUsers = async (req, res) => {
    try {
        console.log('[User Controller] Retrieving all identity records...');
        const users = await User.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('[User Controller] Fetch Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[User Controller] Extracting record for identity: ${id}`);
        const user = await User.getById(id);
        if (!user) return res.status(404).json({ success: false, message: 'Identity not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('[User Controller] Extraction Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // Checking for pre-existing identities
        const users = await User.getAll();
        const exists = users.find(u => u.email === email);
        if (exists) {
            console.warn(`[User Controller] Registration Conflict: ${email}`);
            return res.status(409).json({ success: false, message: 'Identity hash conflict: Email already exists.' });
        }

        // Maintaining consistency with authController (Plain text for now)
        // If security tier upgrade is required, bcryptjs must be added to package.json
        const result = await User.create({
            name,
            email,
            password, 
            role
        });

        console.log(`[User Controller] Identity established: ${name} (${role})`);
        res.status(201).json({ id: result.id, message: 'Identity synchronized successfully' });
    } catch (error) {
        console.error('[User Controller] Provisioning Error:', error.message);
        res.status(500).json({ success: false, message: 'Registry Failure', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[User Controller] Updating registry for: ${id}`);
        await User.update(id, req.body);
        res.status(200).json({ success: true, message: 'Registry updated' });
    } catch (error) {
        console.error('[User Controller] Update Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[User Controller] Decommissioning identity: ${id}`);
        await User.delete(id);
        res.status(200).json({ success: true, message: 'Identity deleted' });
    } catch (error) {
        console.error('[User Controller] Decommission Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

const getManagers = async (req, res) => {
    try {
        console.log('[User Controller] Compiling manager directory...');
        const managers = await User.getManagers();
        res.status(200).json(managers);
    } catch (error) {
        console.error('[User Controller] Compilation Failure:', error.message);
        res.status(500).json({ success: false, message: 'Sync Failure', error: error.message });
    }
};

module.exports = { 
    getAllUsers, 
    getUserById, 
    addUser, 
    updateUser, 
    deleteUser, 
    getManagers 
};

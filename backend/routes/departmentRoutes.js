const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// Fetch all departments
router.get('/', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM departments');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Infrastructure fetch failed' });
    }
});

// Create department
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        await executeQuery('INSERT INTO departments (name) VALUES (?)', [name]);
        res.status(201).json({ success: true, message: 'Department provisioned' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Provisioning failed' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await executeQuery('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
        res.json({ success: true, message: 'Department configuration updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await executeQuery('DELETE FROM departments WHERE id = ?', [id]);
        res.json({ success: true, message: 'Department decommissioned' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Decommissioning failed' });
    }
});

module.exports = router;

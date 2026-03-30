import express from 'express';
import { db } from '../db.js';
import User from '../models/userModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/pulse/frontend
router.get('/frontend', async (req, res) => {
    try {
        const teamMembers = await User.getAll();
        const pulseData = {
            overallProductivity: 94,
            members: teamMembers.map(m => ({ 
                name: m.name, 
                role: m.role, 
                productivity_score: 90 + Math.floor(Math.random() * 10) 
            })),
            projects: [
                { name: 'Dashboard Refactor', status: 'On Track', progress: 85 },
                { name: 'Analytics Engine', status: 'In Risk', progress: 42 },
                { name: 'Personnel API', status: 'On Track', progress: 98 }
            ],
            activityLogs: [
                { user: 'Admin User', action: 'initiated a global sync', timestamp: new Date() },
                { user: 'Manager One', action: 'approved a leave request', timestamp: new Date(Date.now() - 3600000) }
            ]
        };
        res.status(200).json(pulseData);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pulse frontend', error: err.message });
    }
});

// GET /api/pulse/deadlines
router.get('/deadlines', async (req, res) => {
    try {
        const projects = [
            { projectName: 'Infrastructure Update', assignedTeam: 'DevOps', deadline: '2026-04-15', progress: 85, isUrgent: false, daysRemaining: 15 },
            { projectName: 'SaaS Platform Core', assignedTeam: 'Backend', deadline: '2026-03-30', progress: 42, isUrgent: true, daysRemaining: 4 },
            { projectName: 'UI Revitalization', assignedTeam: 'Frontend', deadline: '2026-04-01', progress: 95, isUrgent: false, daysRemaining: 6 }
        ];
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pulse deadlines', error: err.message });
    }
});

export default router;

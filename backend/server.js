const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// 1. Environment Guard
if (!process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error("❌ ERROR: TURSO_DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const { connectDB } = require('./config/db');
const setupDatabase = require('./config/db-setup');

// 2. Route Imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const breakRoutes = require('./routes/breakRoutes');
const bonusRoutes = require('./routes/bonusRoutes');
const meetingRoutes = require('./routes/meetingRoutes'); 
const userRoutes = require('./routes/userRoutes');

const app = express();

// 3. Middlewares
// Global CORS policy as requested
app.use(cors({ origin: "*" }));
app.use(express.json());
// Active Traffic Monitoring
app.use(morgan('📡 [:method] :url -> Status: :status (:response-time ms)'));

// 4. API Request Logging
app.use((req, res, next) => {
  console.log(`[API traffic] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// 5. Health Check as requested
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// 6. Registered Routes with proper /api prefixes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);
// Specialized workforce modules
app.use('/api/breaks', breakRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ 
    success: true, 
    message: 'Admin-Employee Dashboard Backend API Operational',
    port: 5000
}));

// 7. Unknown Routes catch-all
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// 8. Lifecycle Bootup
const startServer = async () => {
    try {
        console.log('🚀 Initializing Enterprise Backend Infrastructure...');
        console.log('Connecting to Turso DB...');
        
        // Test Database Connection
        const isDBReady = await connectDB(3);
        if (!isDBReady) {
            console.error('❌ Cloud Connection Terminal Error: Sync aborted.');
            process.exit(1);
        }
        
        // Sync Schema
        await setupDatabase();
        console.log('✅ Turso Database Synced.');

        // Bind Port - Forced to 5000 as requested
        const PORT = 5000; 
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📡 URL: http://localhost:${PORT}`);
            console.log(`📋 Health Check: http://localhost:${PORT}/api/health\n`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`🔥 FATAL: Port ${PORT} busy. Please stop existing node processes.`);
                process.exit(1);
            } else {
                console.error('🔥 Boot error:', err.message);
                process.exit(1);
            }
        });

    } catch (criticalErr) {
        console.error('🔥 SYSTEM CRITICAL CRASH:');
        console.error(criticalErr.stack);
        process.exit(1);
    }
};

startServer();

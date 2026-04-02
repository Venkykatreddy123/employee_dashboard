const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// 1. Environment Guard: Turso Synchronicity Verification
if (!process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error("❌ ERROR: TURSO_DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const { connectDB } = require('./config/db');
const setupDatabase = require('./config/db-setup');

// 2. Route Topology Mapping
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
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const tursoRoutes = require('./routes/tursoRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// 3. Middlewares: Production Hardening
app.use(cors({
  origin: '*'
}));

app.use(express.json());
// Global Traffic Monitoring
app.use(morgan('📡 [:method] :url -> Status: :status (:response-time ms)'));

// 4. API Request Auditing for Cloud Debugging
app.use((req, res, next) => {
  console.log(`[CLOUD TRACE] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// 5. Health Handshake
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    node: process.env.NODE_ENV || 'production'
  });
});

// 6. Registered Strategy Routes with mandatory /api prefixes 
// As requested for Render-Vercel synchronization
console.log('🏗️  Mapping Organizational Topology...');
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/turso', tursoRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/', (req, res) => res.send('API running'));

// 7. Topology Catch-all
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Strategic Route ${req.method} ${req.url} not found in this node.` 
    });
});

// 8. Lifecycle Bootstrap
/**
 * startServer - Task 4/5 - Robust Startup Logic
 * Ensures the node process survives even if Turkso connectivity oscillates.
 */
const startServer = async () => {
    // Dynamic Port Binding for Render Excellence
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
        console.log(`✅ Production Hub Operational on Port ${PORT}`);
        console.log(`📡 Dashboard API: http://localhost:${PORT}/api`);
        console.log(`📋 Health Check: http://localhost:${PORT}/api/health\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`🔥 PORT ${PORT} OCCUPIED: Shutdown conflicting nodes.`);
            process.exit(1);
        } else {
            console.error('🔥 BOOT ERROR:', err.message);
            process.exit(1);
        }
    });

    try {
        console.log('🚀 Initializing Enterprise Backend Logic...');
        
        // Database Handshake
        const isDBReady = await connectDB(3);
        if (isDBReady) {
            // Task 5: Database execution error handling is wrapped in setupDatabase and client proxy
            await setupDatabase();
            console.log('✅ Final Hub Schema Synchronized.');
        } else {
            console.warn('⚠️  Cloud Connection Warning: Database offline. API functionality will be limited.');
        }

    } catch (criticalErr) {
        console.error('🔥 HUB STARTUP LOGIC FAILURE [Non-Fatal]:');
        console.error(criticalErr.message);
        // We don't exit here so Render can at least hit the health check
    }
};

startServer();

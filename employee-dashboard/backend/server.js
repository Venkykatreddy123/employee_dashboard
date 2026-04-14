const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const routes = require('./routes');
const { initializeTables } = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://empdashboard-p9d7.vercel.app',
    'https://empdashboard-p9d7.vercel.app/'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// 🔌 Socket.io for Real-time
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Pass IO to routes/controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Health check route (Moved to top for health checks like Render)
app.get('/health', (req, res) => {
    res.json({ message: 'Employee Dashboard API is running', status: 'OK' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Employee Dashboard API is running', status: 'OK' });
});

// Routes
app.use('/api', routes);

// 📁 Static Assets & Catch-all (for deployment)
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../frontend/build');
    const indexPath = path.join(buildPath, 'index.html');
    
    // Check if the build directory exists
    if (fs.existsSync(buildPath)) {
        console.log(`Serving static files from: ${buildPath}`);
        app.use(express.static(buildPath));
        
        // Only add catch-all if index.html actually exists to avoid ENOENT errors
        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                } else {
                    res.status(404).json({ 
                        message: 'Frontend index.html NOT found in build directory. If you are using Vercel for frontend, this is expected.',
                        buildPath: buildPath
                    });
                }
            } else {
                res.status(404).json({ message: 'API Route Not Found' });
            }
        });
    } else {
        console.log(`Static build path NOT found: ${buildPath}. Skipping static serving.`);
    }
}

// 🗄️ Initialize DB Tables
initializeTables();

// Socket Connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

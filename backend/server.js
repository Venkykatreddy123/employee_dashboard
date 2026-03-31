import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import breakRoutes from './routes/breakRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import timeRoutes from './routes/timeRoutes.js';
import pulseRoutes from './routes/pulseRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import payslipRoutes from './routes/payslipRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave', leaveRoutes); 
app.use('/api/bonuses', bonusRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payslip', payslipRoutes);

// Static frontend serving (Production)
const frontendPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Senior Employee Dashboard API is running... (Frontend build not found)');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

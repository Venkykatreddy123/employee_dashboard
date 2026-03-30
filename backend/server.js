import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave', leaveRoutes); // Singular for frontend compatibility
app.use('/api/bonuses', bonusRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payslip', payslipRoutes);

app.get('/', (req, res) => {
  res.send('Senior Employee Dashboard API is running...');
});

// Error handling for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

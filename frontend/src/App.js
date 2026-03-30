import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import BreakTracker from './pages/BreakTracker';
import BonusManagement from './pages/BonusManagement';
import MeetingsLog from './pages/MeetingsLog';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SalaryManagement from './pages/SalaryManagement';
import PayslipManagement from './pages/PayslipManagement';

// Protected Route Component with Role Check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="d-flex">
      <Sidebar userRole={user.role} />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Navbar />
        <main className="p-4 bg-light min-vh-100">
          {children}
        </main>
      </div>
    </div>
  );
};

const RoleBasedRedirect = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'manager') return <Navigate to="/manager" />;
  return <Navigate to="/employee" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Role-Specific Dashboards */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
        
        {/* General Dashboard Catch-all or Home */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Admin and Manager features */}
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Employees />
          </ProtectedRoute>
        } />
        
        {/* Protocol Details / Employee Specific View */}
        <Route path="/employee/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
        
        {/* Attendance (Personal or Team based) */}
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        
        {/* Leave (Apply or Approve) */}
        <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        
        {/* Break Tracking */}
        <Route path="/breaks" element={<ProtectedRoute><BreakTracker /></ProtectedRoute>} />
        
        {/* Bonus (Admin/Manager only view, or personal view) */}
        <Route path="/bonuses" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <BonusManagement />
          </ProtectedRoute>
        } />

        {/* Meeting Logs */}
        <Route path="/meetings" element={<ProtectedRoute><MeetingsLog /></ProtectedRoute>} />

        {/* Salary and Payslips */}
        <Route path="/salary" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <SalaryManagement />
          </ProtectedRoute>
        } />
        <Route path="/payslips" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
            <PayslipManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;

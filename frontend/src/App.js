import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginPage';
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
  
  // All roles use the main Dashboard.js, which internally handles role-based display
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'manager') return <Navigate to="/manager" />;
  return <Navigate to="/employee" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* All main roles now utilize the unified Dashboard analytics view */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><Dashboard /></ProtectedRoute>} />
        <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><Dashboard /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Employees />
          </ProtectedRoute>
        } />
        
        <Route path="/employee/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/breaks" element={<ProtectedRoute><BreakTracker /></ProtectedRoute>} />
        <Route path="/bonuses" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <BonusManagement />
          </ProtectedRoute>
        } />
        <Route path="/meetings" element={<ProtectedRoute><MeetingsLog /></ProtectedRoute>} />

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

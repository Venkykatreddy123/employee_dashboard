import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/dashboard.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDirectory from './pages/EmployeeDirectory';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import BreakTracker from './pages/BreakTracker';
import BonusManagement from './pages/BonusManagement';
import Meetings from './pages/Meetings';

// Components
import Layout from './components/Layout';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== 'admin' && role !== requiredRole) return <Navigate to="/" replace />; // Support manager/admin bypass
  
  return <Layout>{children}</Layout>;
};

function App() {
  const role = localStorage.getItem('role'); // Get role to conditionally check default route

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Core Routes - Accessible by Admin and Auth Employees */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/breaks" element={<ProtectedRoute><BreakTracker /></ProtectedRoute>} />
        <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
        
        {/* Administrative routes */}
        <Route path="/employees" element={<ProtectedRoute requiredRole="manager"><Employees /></ProtectedRoute>} />
        <Route path="/bonuses" element={<ProtectedRoute requiredRole="admin"><BonusManagement /></ProtectedRoute>} />

        {/* Employee only routes */}
        <Route path="/directory" element={<ProtectedRoute><EmployeeDirectory /></ProtectedRoute>} />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

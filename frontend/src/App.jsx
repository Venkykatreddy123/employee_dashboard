import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Projects from './pages/Projects'
import Leaves from './pages/Leaves'
import Attendance from './pages/Attendance'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Salary from './pages/Salary'
import Performance from './pages/Performance'
import MeetingsLog from './pages/MeetingsLog'
import MeetingRoom from './pages/MeetingRoom'
import JoinRedirect from './pages/JoinRedirect'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
        <Route path="employees" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
            <Employees />
          </ProtectedRoute>
        } />
        
        <Route path="projects" element={<Projects />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="profile" element={<Profile />} />
        <Route path="salary" element={<Salary />} />
        <Route path="performance" element={<Performance />} />
        <Route path="meetings" element={<MeetingsLog />} />
        <Route path="meetings/:meeting_id" element={<MeetingRoom />} />
        <Route path="meet/:meeting_id" element={<JoinRedirect />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

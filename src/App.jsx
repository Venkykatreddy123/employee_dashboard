import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminProjectsPage from './pages/AdminProjectsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />
            )
          }
        />

        {/* Employee Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/projects" element={<ProtectedRoute allowedRoles={['employee']}><ProjectsPage /></ProtectedRoute>} />
        <Route path="/dashboard/tasks" element={<ProtectedRoute allowedRoles={['employee']}><TasksPage /></ProtectedRoute>} />
        <Route path="/dashboard/calendar" element={<ProtectedRoute allowedRoles={['employee']}><CalendarPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['employee']}><SettingsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployeesPage /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin']}><AdminProjectsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? user?.role === 'admin'
                    ? '/admin'
                    : '/dashboard'
                  : '/login'
              }
              replace
            />
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

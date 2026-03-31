import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ErrorBoundary from '@/components/ErrorBoundary';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import EmployeeDetails from '@/features/manager/pages/EmployeeDetails';
import Unauthorized from '@/pages/Unauthorized';
import LeaveApplication from '@/features/employee/pages/LeaveApplication';
import LeaveApproval from '@/features/manager/pages/LeaveApproval';
import UserManagement from '@/features/admin/pages/UserManagement';
import SystemConfig from '@/features/admin/pages/SystemConfig';
import TeamDirectory from '@/features/manager/pages/TeamDirectory';
import ProductivityReports from '@/features/manager/pages/ProductivityReports';
import SessionTracking from '@/features/employee/pages/SessionTracking';
import BreakTracking from '@/features/employee/pages/BreakTracking';
import MeetingLogging from '@/features/employee/pages/MeetingLogging';
import PersonalReports from '@/features/employee/pages/PersonalReports';
import SalaryManagement from '@/pages/admin/SalaryManagement';
import PayslipManagement from '@/pages/admin/PayslipManagement';
import Payslip from '@/pages/employee/Payslip';
import TeamPayslips from '@/pages/manager/TeamPayslips';

const AppLayout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']} />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="unauthorized" element={<Unauthorized />} />
                  <Route path="employee/:id" element={<EmployeeDetails />} />

                  {/* Employee + Manager routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Employee', 'Manager']} />}>
                    <Route path="payslips" element={<Payslip />} />
                  </Route>

                  {/* Employee only routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
                    <Route path="session" element={<SessionTracking />} />
                    <Route path="breaks" element={<BreakTracking />} />
                    <Route path="meetings" element={<MeetingLogging />} />
                    <Route path="leave/apply" element={<LeaveApplication />} />
                    <Route path="reports/personal" element={<PersonalReports />} />
                  </Route>

                  {/* Manager only routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Manager']} />}>
                    <Route path="team" element={<TeamDirectory />} />
                    <Route path="leave/approve" element={<LeaveApproval />} />
                    <Route path="manager/payslips" element={<TeamPayslips />} />
                    <Route path="reports/team" element={<ProductivityReports />} />
                  </Route>

                  {/* Admin only routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                    <Route path="admin/users" element={<UserManagement />} />
                    <Route path="admin/config" element={<SystemConfig />} />
                    <Route path="admin/salary" element={<SalaryManagement />} />
                    <Route path="admin/payslips" element={<PayslipManagement />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
};

export default App;

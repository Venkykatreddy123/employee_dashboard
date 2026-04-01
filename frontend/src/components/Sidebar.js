import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Coffee, 
  Heart, 
  LogOut,
  Video,
  DollarSign,
  FileText
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define menu items per role
  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
      { name: 'User Management', path: '/employees', icon: <Users size={20} /> },
      { name: 'System Attendance', path: '/attendance', icon: <Clock size={20} /> },
      { name: 'Leave Queue', path: '/leaves', icon: <CalendarDays size={20} /> },
      { name: 'Break History', path: '/breaks', icon: <Coffee size={20} /> },
      { name: 'Performance/Bonus', path: '/bonuses', icon: <Heart size={20} /> },
      { name: 'Tactical Syncs', path: '/manager/meetings', icon: <Video size={20} /> },
      { name: 'Meeting Logs', path: '/meetings', icon: <FileText size={20} /> },
      { name: 'Salary Control', path: '/salary', icon: <DollarSign size={20} /> },
      { name: 'All Payslips', path: '/payslips', icon: <FileText size={20} /> },
    ],
    manager: [
      { name: 'Team Overview', path: '/manager', icon: <LayoutDashboard size={20} /> },
      { name: 'Team Directory', path: '/employees', icon: <Users size={20} /> },
      { name: 'Team Attendance', path: '/attendance', icon: <Clock size={20} /> },
      { name: 'Leave Approvals', path: '/leaves', icon: <CalendarDays size={20} /> },
      { name: 'Meeting Scheduler', path: '/manager/meetings', icon: <Video size={20} /> },
      { name: 'Team Payslips', path: '/payslips', icon: <FileText size={20} /> },
    ],
    employee: [
      { name: 'Personal Dash', path: '/employee', icon: <LayoutDashboard size={20} /> },
      { name: 'Session Tracker', path: '/attendance', icon: <Clock size={20} /> },
      { name: 'Leave Application', path: '/leaves', icon: <CalendarDays size={20} /> },
      { name: 'Break Tracker', path: '/breaks', icon: <Coffee size={20} /> },
      { name: 'Assigned Meetings', path: '/employee/meetings', icon: <Video size={20} /> },
      { name: 'My Payslips', path: '/payslips', icon: <FileText size={20} /> },
    ]
  };

  const navItems = menuItems[userRole] || [];

  return (
    <div className="sidebar d-flex flex-column shadow-sm">
      <div className="sidebar-logo">
        <span style={{ color: '#6366f1' }}>EMP</span> Admin
        <div className="small text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
          {userRole} Access
        </div>
      </div>
      <div className="flex-grow-1 overflow-auto mt-3">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="me-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto p-4 border-top border-secondary">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const role = localStorage.getItem('role');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Nexus HR
      </div>
      <div className="sidebar-menu">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        
        <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Attendance
        </NavLink>

        <NavLink to="/breaks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Break Tracker
        </NavLink>

        <NavLink to="/meetings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Meetings
        </NavLink>

        <NavLink to="/leaves" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Leave Management
        </NavLink>

        {(role === 'admin' || role === 'manager') && (
          <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Employees
          </NavLink>
        )}

        {role === 'admin' && (
          <NavLink to="/bonuses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Bonus Management
          </NavLink>
        )}

        {role !== 'admin' && (
          <NavLink to="/directory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Directory
          </NavLink>
        )}
      </div>
    </aside>

  );
};

export default Sidebar;

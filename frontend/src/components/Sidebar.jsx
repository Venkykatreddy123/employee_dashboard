import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layout, 
  Clock, 
  Coffee, 
  Calendar, 
  Briefcase, 
  Users, 
  Award, 
  List,
  ChevronRight,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const role = localStorage.getItem('role');

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Layout, roles: ['admin', 'manager', 'employee'] },
    { name: 'Attendance', path: '/attendance', icon: Clock, roles: ['admin', 'manager', 'employee'] },
    { name: 'Break Tracker', path: '/breaks', icon: Coffee, roles: ['admin', 'manager', 'employee'] },
    { name: 'Meetings', path: '/meetings', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
    { name: 'Leaves', path: '/leaves', icon: Briefcase, roles: ['admin', 'manager', 'employee'] },
    { name: 'Directory', path: '/directory', icon: List, roles: ['admin', 'manager', 'employee'] },
    { name: 'Workforce', path: '/employees', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Incentives', path: '/bonuses', icon: Award, roles: ['admin'] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
          <Shield size={18} className="text-white" />
        </div>
        <span>CloudOps</span><span className="text-primary font-black">.</span>
      </div>
      
      <nav className="sidebar-menu py-6">
        <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Operations</p>
        <div className="space-y-1">
          {menuItems.map((item) => {
              if (item.roles.includes(role)) {
                  return (
                      <NavLink 
                          key={item.path}
                          to={item.path} 
                          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      >
                          <item.icon size={18} className="mr-3" />
                          <span className="flex-1">{item.name}</span>
                          <ChevronRight className="chevron opacity-0 transition-opacity" size={14} />
                      </NavLink>
                  );
              }
              return null;
          })}
        </div>
      </nav>

      <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Connectivity</span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                Workspace telemetry synchronized with edge nodes.
              </p>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;

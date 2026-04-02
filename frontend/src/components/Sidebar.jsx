import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CalendarClock, 
  UserCircle, 
  LogOut, 
  Award,
  Wallet,
  Clock,
  Video,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, logout } = useAuth();
  
  const handleLinkClick = () => {
    // 📱 Auto close on mobile after click (Target Goal 5)
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };
  
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/employees', icon: Users, label: 'Employees', roles: ['Admin', 'Manager', 'HR'] },
    { to: '/projects', icon: Briefcase, label: 'Projects', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/leaves', icon: CalendarClock, label: 'Leaves', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/attendance', icon: Clock, label: 'Attendance', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/salary', icon: Wallet, label: 'Salaries', roles: ['Admin', 'HR', 'Employee'] },
    { to: '/performance', icon: Award, label: 'Performance', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/meetings', icon: Video, label: 'Meetings', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { to: '/profile', icon: UserCircle, label: 'My Profile', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user.role));

  return (
    <>
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col 
        transition-transform duration-300 transform w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
               <span className="text-white font-bold text-xl">E</span>
             </div>
             <span className="font-bold text-gray-900 text-lg tracking-tight">EmpDash</span>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-gray-600">
             <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

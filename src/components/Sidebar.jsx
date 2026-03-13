import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { cn } from '../lib/utils';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin ? [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Employees', icon: Users, path: '/admin/employees' },
    { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ] : [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Projects', icon: Briefcase, path: '/dashboard/projects' },
    { name: 'My Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
    { name: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className={cn(
      "h-screen bg-[#0f0f0f] border-r border-[#222] transition-all duration-300 flex flex-col sticky top-0",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#222]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">E</div>
            <span className="font-bold text-white tracking-tight">EMPULSE</span>
          </div>
        )}
        {collapsed && <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white mx-auto">E</div>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg border border-[#333] hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 space-y-2 px-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
              isActive 
                ? "bg-blue-600/10 text-blue-500" 
                : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", collapsed ? "mx-auto" : "")} />
            {!collapsed && <span className="font-medium">{item.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* User & Logout */}
      <div className="p-3 border-t border-[#222]">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-[#161616] mb-2",
          collapsed ? "justify-center" : ""
        )}>
          <img 
            src={user?.avatar} 
            alt="Avatar" 
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-600/20"
          />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all group",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

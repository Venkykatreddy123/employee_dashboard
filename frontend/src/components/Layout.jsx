import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Calendar, 
  Clock, 
  BarChart3, 
  ShieldCheck,
  Bell,
  Search,
  User,
  Zap as ZapIcon,
  Wallet,
  Gift,
  LifeBuoy,
  Menu,
  Hash,
  Mail,
  Shield,
  Briefcase as DeptIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailModal from './DetailModal';

const Sidebar = ({ user, isOpen, setIsOpen }) => {
  const role = user.role?.toLowerCase() || '';
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['employee', 'manager', 'admin'] },
    { name: 'Payroll & Tax', icon: Wallet, path: '/payroll', roles: ['employee', 'manager', 'admin'] },
    { name: 'Benefits Plan', icon: Gift, path: '/benefits', roles: ['employee', 'manager', 'admin'] },
    { name: 'Leave Tracker', icon: Calendar, path: '/leave', roles: ['employee', 'manager', 'admin'] },
    { name: 'Performance', icon: BarChart3, path: '/performance', roles: ['employee', 'manager', 'admin'] },
    { name: 'Team Pulse', icon: Users, path: '/manager', roles: ['manager', 'admin'] },
    { name: 'Support', icon: LifeBuoy, path: '/support', roles: ['employee', 'manager', 'admin'] },
    { name: 'Admin Panel', icon: ShieldCheck, path: '/admin', roles: ['admin'] },
  ].filter(item => item.roles.includes(role));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} bg-white flex flex-col shadow-2xl lg:shadow-none`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <ZapIcon size={22} className="text-white fill-current" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">EMP PRO</span>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative font-bold text-sm
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black">
                {user.name ? user.name[0] : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
    </aside>
  );
};

const Navbar = ({ user, onLogout, toggleSidebar }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600">
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase leading-none">{user.role}</p>
          </div>
          <button 
            onClick={() => window.openProfile && window.openProfile()}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:scale-105 transition-all"
          >
             <User size={20} className="text-slate-400" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

const Layout = () => {
  const [user, setUser] = useState({ name: 'Guest', role: 'None' });
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    window.openProfile = () => setShowProfile(true);
  }, [location.pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="main-content">
        <Navbar user={user} onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </main>

        <DetailModal isOpen={showProfile} onClose={() => setShowProfile(false)} title="My Profile">
          <div className="space-y-10 p-4">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-4xl shadow-xl shadow-indigo-50">
                 {user.name ? user.name[0] : '?'}
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900">{user.name}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-1">{user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: 'Employee ID', value: user.employee_code || 'EMP001', icon: Hash },
                 { label: 'Work Email', value: user.email, icon: Mail },
                 { label: 'Account Role', value: user.role, icon: Shield },
                 { label: 'Join Date', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Mar 25, 2026', icon: Calendar }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                       <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                      <p className="text-sm font-black text-slate-800 break-all">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </DetailModal>
      </div>
    </div>
  );
};

export default Layout;


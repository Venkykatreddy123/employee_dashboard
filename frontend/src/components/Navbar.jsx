import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Bell, Settings, Search, Menu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'User';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin', email: 'admin@cloudops.com' };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="top-navbar">
        <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search intelligence..." 
                    className="form-input pl-10 h-10 py-0 border-transparent bg-slate-50 hover:bg-slate-100 transition-colors focus:bg-white"
                />
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center pr-4 border-r border-slate-100 gap-1">
                <div className="p-2 text-slate-400 hover:text-primary transition-all cursor-pointer relative group">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white ring-2 ring-transparent group-hover:ring-danger/20 transition-all"></span>
                </div>
                <div className="p-2 text-slate-400 hover:text-primary transition-all cursor-pointer">
                    <Settings size={18} />
                </div>
            </div>

            <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{role}</p>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold border border-slate-800 shadow-sm transition-transform active:scale-95">
                      <UserIcon size={18} />
                  </div>
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white"></div>
                </div>
                <button 
                    className="p-2 ml-1 text-slate-400 hover:text-danger transform transition-all hover:rotate-12"
                    onClick={handleLogout}
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default Navbar;

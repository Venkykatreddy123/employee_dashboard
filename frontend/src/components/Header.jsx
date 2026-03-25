import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl text-gray-400 focus-within:ring-2 focus-within:ring-primary-100 focus-within:bg-white transition-all w-96">
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Search employees, projects..." 
          className="bg-transparent border-none focus:outline-none text-sm text-gray-600 w-full"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-primary-600 transition-colors">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-tight">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-primary-50">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

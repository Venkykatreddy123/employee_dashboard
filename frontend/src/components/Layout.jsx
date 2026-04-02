import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      {/* Target: Sidebar Visibility State Management */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      {/* MOBILE OVERLAY: Closes sidebar when clicking background on small devices */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-8 animate-fade-in w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

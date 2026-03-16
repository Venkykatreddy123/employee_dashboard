import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useIdle from '../hooks/useIdle';

const Layout = ({ children }) => {
  // Global idle detection every 5 minutes
  useIdle(5);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          <div className="container-premium animate-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

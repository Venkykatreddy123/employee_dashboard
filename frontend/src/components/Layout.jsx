import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

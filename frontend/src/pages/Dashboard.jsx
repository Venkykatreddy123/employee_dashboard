import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp } from 'lucide-react';
import EmployeeDashboard from '@/features/employee/pages/EmployeeDashboard';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManagerDashboard from '@/features/manager/pages/ManagerDashboard';
import ProductivityTable from '@/features/manager/components/ProductivityTable';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text("Executive Intelligence Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Requester: ${user.name} (${user.role})`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

    const tableData = [
      ["1", "Admin User", "Admin", "admin@company.com"],
      ["2", "Manager User", "Manager", "manager@company.com"],
      ["3", "Employee User", "Employee", "employee@company.com"]
    ];

    autoTable(doc, {
        startY: 45,
        head: [["ID", "Name", "Role", "Email"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save('EMP_Intelligence_Report.pdf');
  };

  const handleRefresh = () => {
    window.location.reload(); 
  };

  if (user.role === 'Employee') {
    return <EmployeeDashboard user={user} />;
  }

  return (
    <div className="fade-in">
       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>{user.role} Intelligence Hub</h2>
            <p style={{ color: '#64748b' }}>Precision monitoring and organizational control panel</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <button className="btn btn-outline" onClick={handleExport}>
               <TrendingUp size={16} /> Export PDF Intelligence
             </button>
             <button className="btn btn-primary" onClick={handleRefresh}>Refresh Streams</button>
          </div>
       </header>

       {user.role === 'Admin' ? <AdminDashboard user={user} /> : <ManagerDashboard user={user} />}
       <ProductivityTable />
    </div>
  );
};

export default Dashboard;

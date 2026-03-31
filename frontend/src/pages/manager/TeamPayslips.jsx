import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Download, Users, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TeamPayslips = () => {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayslips = async () => {
        try {
            const res = await fetch(`/api/team-payslips`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setPayslips(data.payslips);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslips();
    }, []);

    const exportToCSV = () => {
        // Headers
        const headers = ["ID", "Employee ID", "Employee Name", "Role", "Month", "Year", "Basic Salary", "Allowances", "Deductions", "Net Salary", "Generated At"];
        
        // Data mapping
        const csvRows = payslips.map(p => [
            p.id,
            p.userId,
            p.employeeName,
            p.role,
            p.month,
            p.baseSalary,
            p.allowances,
            p.deductions,
            p.netSalary,
            new Date(p.createdAt).toLocaleDateString()
        ]);
        
        // Final CSV content
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Team_Payslips_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = async (p) => {
      try {
          const res = await fetch(`/api/payslips/${p.id}/download`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
          });
          
          if (!res.ok) {
            const err = await res.json();
            alert(err.message || 'Error downloading PDF');
            return;
          }

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Payslip_${p.employeeName}_${p.month}_${p.year}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (err) {
          console.error('Download error:', err);
          alert('Failed to connect to server');
      }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>Team Payslips</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and export your team's monthly payroll statements</p>
                </div>
                {payslips.length > 0 && (
                    <button className="btn btn-outline" onClick={exportToCSV}>
                        <FileSpreadsheet size={18} /> Export CSV
                    </button>
                )}
            </header>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Employee</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Period</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Base Salary</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Net Salary</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payslips.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{s.employeeName}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>{s.month}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>${s.baseSalary?.toLocaleString()}</td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4f46e5' }}>${s.netSalary.toLocaleString()}</td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => downloadPDF(s)}
                                        className="btn btn-outline" 
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    >
                                        Download PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {payslips.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <Users size={32} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                                    No team payslips available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamPayslips;

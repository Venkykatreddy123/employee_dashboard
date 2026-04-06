import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Download, Users, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229);
        doc.text("Team Payroll Summary", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Organization: EMP Logic Research`, 14, 30);
        doc.text(`Period: ${payslips.length > 0 ? payslips[0].month + ' ' + payslips[0].year : 'N/A'}`, 14, 35);
        doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 40);

        // Prep table data
        const tableData = payslips.map(p => [
            p.employeeName,
            p.month,
            `$${p.baseSalary?.toLocaleString()}`,
            `$${p.bonus?.toLocaleString() || 0}`,
            `$${p.deductions?.toLocaleString() || 0}`,
            `$${p.netSalary?.toLocaleString()}`
        ]);

        // Generate table
        autoTable(doc, {
            startY: 50,
            head: [["Employee", "Month", "Base", "Bonus", "Deductions", "Net Salary"]],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 50 },
        });

        // Save
        doc.save(`Team_Payroll_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const downloadPDF = async (p) => {
      try {
          const res = await fetch(`/api/payslips/${p.id}/pdf`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
          });
          
          if (!res.ok) {
            const err = await res.json();
            alert(err.message || 'Error downloading PDF');
            return;
          }

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          
          // Format: EmployeeName_Month_Year_Payslip.pdf
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const monthIndex = parseInt(p.month, 10) - 1;
          const monthName = monthNames[monthIndex] || p.month;
          
          const safeName = (p.employeeName || 'Employee').replace(/\s+/g, '_');
          const filename = `${safeName}_${monthName}_${p.year}_Payslip.pdf`;
          
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          }, 100);
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
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and export your team's monthly payroll statements in PDF format</p>
                </div>
                {payslips.length > 0 && (
                    <button className="btn btn-primary" onClick={exportToPDF}>
                        <Download size={18} /> Export PDF Report
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

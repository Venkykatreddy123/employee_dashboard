import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Download, FileText, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE } from '@/services/apiClient';

const PayslipManagement = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/payslips`, {
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

    const handleGeneratePayslips = async () => {
        if (!confirm('Are you sure you want to generate payslips for all employees for the current month?')) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/payslips/generate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('emp_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchPayslips();
            } else {
                alert(data.message || 'Failed to generate payslips');
            }
        } catch (err) {
            console.error('Generation error:', err);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslips();
    }, []);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229);
        doc.text("Organization-wide Payroll Report", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 30);

        const tableData = filteredPayslips.map(p => [
            p.employee_name,
            `${p.month}/${p.year}`,
            `$${p.basic_salary?.toLocaleString()}`,
            `$${p.net_salary?.toLocaleString()}`,
            new Date(p.created_at).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 40,
            head: [["Employee", "Period", "Base Salary", "Net Salary", "Generated At"]],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save(`All_Payslips_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const downloadPDF = async (p) => {
        try {
            const res = await fetch(`${API_BASE}/payslips/${p.id}/download`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
            });
            
            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Error generating PDF');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Format: EmployeeName_Month_Year_Payslip.pdf
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthIndex = parseInt(p.month, 10) - 1;
            const monthName = monthNames[monthIndex] || p.month;
            
            const safeName = (p.employee_name || 'Statement').replace(/\s+/g, '_');
            const filename = `${safeName}_${monthName}_${p.year}_Payslip.pdf`;
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (err) {
            console.error('Download error:', err);
            alert('Server connection failed');
        }
    };

    const filteredPayslips = payslips.filter(p => 
        p.employee_name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.employee_id.toString().includes(filter)
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Payslip Management</h2>
                    <p style={{ color: '#64748b' }}>Search and download all organization-wide generated payslips</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={exportToPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Export PDF Report
                    </button>
                    <button className="btn btn-primary" onClick={handleGeneratePayslips} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} /> Generate Monthly Payslips
                    </button>
                    <div className="search-box" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            style={{ padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', width: '250px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Employee</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Month/Year</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Net Amount</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Generated At</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayslips.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>
                                            {p.employee_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{p.employee_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EMP-{p.employee_id.toString().padStart(3, '0')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.month} / {p.year}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4f46e5' }}>
                                    ${p.net_salary?.toLocaleString()}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ padding: '0.5rem', borderRadius: '8px' }}
                                        onClick={() => downloadPDF(p)}
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {loading && (
                           <tr>
                               <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                   Loading payslips...
                               </td>
                           </tr>
                        )}
                        {!loading && filteredPayslips.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <FileText size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                                    No payslips found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayslipManagement;

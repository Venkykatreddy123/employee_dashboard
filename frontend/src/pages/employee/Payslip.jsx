import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Banknote, Download, Calendar, Wallet, FileText, Info } from 'lucide-react';
import { API_BASE } from '@/services/apiClient';

const Payslip = () => {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/payslips/my`, {
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
        if (user?.id) fetchPayslips();
    }, [user]);

    const downloadPDF = async (p) => {
        try {
            const res = await fetch(`${API_BASE}/payslips/${p.id}/download`, {
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
            
            const safeName = (p.employee_name || 'Employee').replace(/\s+/g, '_');
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
            alert('Failed to connect to server');
        }
    };

    const getMonthName = (monthStr) => {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const index = parseInt(monthStr, 10) - 1;
        return monthNames[index] || monthStr;
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>My Payslips</h2>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and download your monthly salary statements</p>
            </header>

            {!loading && payslips.length > 0 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                                <th style={{ padding: '1rem 1.5rem' }}>Month</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Year</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Net Salary</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payslips.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{getMonthName(p.month)}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>{p.year}</td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4f46e5' }}>${p.net_salary.toLocaleString()}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', background: '#eef2ff', color: '#4f46e5', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>PROCESSED</span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => downloadPDF(p)}>
                                            <Download size={16} /> Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : loading ? (
                 <div style={{ textAlign: 'center', padding: '5rem' }}>Loading payslips...</div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <Wallet size={32} style={{ color: '#94a3b8' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>No payslips generated yet</h3>
                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0.5rem auto 0' }}>Your monthly payroll statements will appear here once they are generated by the administrator.</p>
                </div>
            )}
        </div>
    );
};

export default Payslip;

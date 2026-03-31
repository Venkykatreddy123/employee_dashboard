import React, { useState, useEffect } from 'react';
import { Banknote, Search, Calendar, User, Download, FileText, Filter } from 'lucide-react';

const PayslipManagement = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/payslips', {
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

    const downloadPDF = async (p) => {
        try {
            const res = await fetch(`/api/payslips/${p.id}/download`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
            });
            
            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Error generating PDF');
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
            alert('Server connection failed');
        }
    };

    const filteredPayslips = payslips.filter(p => 
        p.employeeName?.toLowerCase().includes(filter.toLowerCase()) ||
        p.userId.toString().includes(filter)
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Payslip Management</h2>
                    <p style={{ color: '#64748b' }}>Search and download all organization-wide generated payslips</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
                                            {p.employeeName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{p.employeeName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EMP-{p.userId.toString().padStart(3, '0')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.month} / {p.year}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4f46e5' }}>
                                    ${p.netSalary?.toLocaleString()}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                    {new Date(p.generatedAt).toLocaleDateString()}
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Banknote, Download, Calendar, ArrowRight, Wallet, History, Info } from 'lucide-react';

const Payslip = () => {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayslips = async () => {
        try {
            const res = await fetch(`/api/payslips/my`, {
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
            
            // Format: EmployeeName_Month_Year_Payslip.pdf
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthIndex = parseInt(p.month, 10) - 1;
            const monthName = monthNames[monthIndex] || p.month;
            
            const safeName = (user?.name || 'Employee').replace(/\s+/g, '_');
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

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>My Payslips</h2>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and download your monthly salary statements</p>
            </header>

            {payslips.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {payslips.map(p => (
                        <div key={p.id} className="card" style={{ 
                            position: 'relative', 
                            padding: '2rem', 
                            border: '1px solid #e2e8f0', 
                            transition: 'all 0.2s',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottomLeftRadius: '16px', borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                PROCESSED
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#334155' }}>{p.month}</h4>
                                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Payroll Period</p>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Base Salary</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${p.baseSalary.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Allowances</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>+${p.allowances.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Deductions</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>-${p.deductions.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Net Amount</p>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5' }}>${p.netSalary.toLocaleString()}</h3>
                                </div>
                                <button className="btn btn-outline" style={{ borderRadius: '10px', padding: '0.625rem 1rem' }} onClick={() => downloadPDF(p)} title="Download PDF Payslip">
                                    <Download size={18} />
                                </button>
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Info size={12} />
                                Available for immediate tax filing
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <Wallet size={32} style={{ color: '#94a3b8' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>No Payslips Available</h3>
                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0.5rem auto 0' }}>Your monthly payroll statements will appear here once your salary record is configured by Admin.</p>

                </div>
            )}
        </div>
    );
};

export default Payslip;

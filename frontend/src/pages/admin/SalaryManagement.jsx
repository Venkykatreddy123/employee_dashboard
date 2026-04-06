import React, { useState, useEffect } from 'react';
import { getUsers } from '@/services/usersService';
import { Wallet, Plus, Search, Calendar, User, Download } from 'lucide-react';

const SalaryManagement = () => {
    const [users, setUsers] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        baseSalary: '',
        bonus: '0',
        allowances: '0',
        deductions: '0',
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, '0')
    });

    const fetchData = async () => {
        try {
            const usersData = await getUsers();
            setUsers(usersData);

            const res = await fetch('/api/salary/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('emp_token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setSalaries(data.salaries);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/salary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('emp_token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Salary record saved!');
                setIsModalOpen(false);
                fetchData();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error saving salary');
        }
    };


    const handleGenerateAll = async () => {
        const confirmGen = window.confirm('Generate payslips for all salary records?');
        if (!confirmGen) return;

        try {
            const res = await fetch('/api/admin/generate-payslips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('emp_token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error generating payslips in bulk');
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Salary Management</h2>
                    <p style={{ color: '#64748b' }}>Configure employee payroll and generate monthly payslips</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handleGenerateAll}>
                        <Download size={18} /> Generate All PDF Payslips
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add Salary Record
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Employee</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Month</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Base Salary</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Net Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{s.employeeName || s.employee_name}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>{s.month}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>${s.baseSalary?.toLocaleString() || s.base_salary?.toLocaleString()}</td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4f46e5' }}>${s.netSalary?.toLocaleString() || s.net_salary?.toLocaleString()}</td>
                            </tr>
                        ))}
                        {salaries.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No salary records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '500px', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add Salary Record</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Employee</label>
                                <select 
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    value={formData.userId}
                                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                >
                                    <option value="">Select Employee</option>
                                    {users.filter(u => u.role !== 'Admin').map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Year</label>
                                    <select required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Month</label>
                                    <select required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})}>
                                        {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Base Salary</label>
                                    <input type="number" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.baseSalary} onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Bonus</label>
                                    <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.bonus} onChange={(e) => setFormData({...formData, bonus: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Allowances</label>
                                    <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.allowances} onChange={(e) => setFormData({...formData, allowances: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Deductions</label>
                                    <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryManagement;

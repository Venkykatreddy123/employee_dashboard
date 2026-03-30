import React, { useState, useEffect } from 'react';
import api from '../api/api';

const SalaryManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [formData, setFormData] = useState({
        base_salary: '',
        bonus: '',
        deductions: '',
        month: new Date().toLocaleString('default', { month: 'long' })
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchEmps = async () => {
            try {
                const { data } = await api.get('/users');
                setEmployees(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEmps();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            await fetch('/api/salary', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    employee_id: selectedEmp,
                    base_salary: formData.base_salary,
                    bonus: formData.bonus,
                    deductions: formData.deductions,
                    month: formData.month
                })
            });
            setMsg('Salary successfully updated');
        } catch (err) {
            console.error(err);
            setMsg('Failed to update salary');
        }
        setLoading(false);
    };

    return (
        <div className="px-4 py-3">
            <h4 className="fw-bold mb-4">Salary Administration Node</h4>
            
            <div className="card shadow-sm border-0 p-4" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    {msg && <div className="alert alert-info">{msg}</div>}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Select Personnel</label>
                        <select className="form-select" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} required>
                            <option value="">-- Select Employee --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Active Processing Month</label>
                        <select className="form-select" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})}>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label fw-bold">Base Salary ($)</label>
                            <input type="number" className="form-control" placeholder="60000" value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})} required />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label fw-bold">Bonuses ($)</label>
                            <input type="number" className="form-control" placeholder="5000" value={formData.bonus} onChange={e => setFormData({...formData, bonus: e.target.value})} required />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label fw-bold">Deductions ($)</label>
                            <input type="number" className="form-control" placeholder="2500" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 fw-bold mt-2" disabled={loading}>
                        {loading ? 'Processing...' : 'Allocate Regional Salary'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SalaryManagement;

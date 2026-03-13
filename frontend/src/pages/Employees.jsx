import React, { useState, useEffect } from 'react';
import api from '../api/api';
import EmployeeTable from '../components/EmployeeTable';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '', role: 'employee', department: '', salary: '', manager_id: '' });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees', { ...newEmployee, joining_date: new Date().toISOString().split('T')[0] });
            setShowModal(false);
            setNewEmployee({ name: '', email: '', password: '', role: 'employee', department: '', salary: '', manager_id: '' });
            fetchEmployees();
        } catch (error) {
            console.error('Error adding employee', error);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to remove this employee?')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee', error);
            }
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Personnel Management</h2>
                    <p className="text-muted small">Architecting the global workforce ecosystem.</p>
                </div>
                <button className="btn btn-primary px-4" onClick={() => setShowModal(true)}>Deploy Personnel</button>
            </div>

            <div className="glass-card">
                <EmployeeTable employees={employees} onDelete={handleDelete} />
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="glass-card" style={{width: '640px', maxWidth: '95%', padding: '2.5rem', border: '1px solid var(--border-glass)'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="m-0" style={{fontWeight: '700', color: '#1e293b'}}>Personnel Induction</h4>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Full Identity</label>
                                <input type="text" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} required />
                            </div>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Communication Protocol (Email)</label>
                                    <input type="email" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Access Signature (Password)</label>
                                    <input type="password" placeholder="Temporal Key" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} required />
                                </div>
                            </div>
                            <div className="row mb-4">
                                 <div className="col-md-4">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Role Access</label>
                                    <select className="form-select bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}>
                                        <option value="employee">Standard Specialist</option>
                                        <option value="manager">Unit Manager</option>
                                        <option value="admin">Nexus Overseer</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Org Unit</label>
                                    <input type="text" placeholder="e.g., Engineering" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} />
                                </div>
                                <div className="col-md-4">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Reporting Overseer</label>
                                    <select className="form-select bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.manager_id} onChange={e => setNewEmployee({...newEmployee, manager_id: e.target.value})}>
                                        <option value="">Independent</option>
                                        {employees.filter(emp => emp.role === 'manager' || emp.role === 'admin').map(mgr => (
                                            <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Compensation Rate ($)</label>
                                    <input type="number" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} />
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-5">
                                <button type="submit" className="btn btn-primary flex-grow-1" style={{fontWeight: '600'}}>Commit Induction</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;

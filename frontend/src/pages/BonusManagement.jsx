import React, { useState, useEffect } from 'react';
import api from '../api/api';

import BonusTable from '../components/BonusTable';

const BonusManagement = () => {
    const [bonuses, setBonuses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newBonus, setNewBonus] = useState({ employee_id: '', bonus_amount: '', bonus_reason: '' });
    
    // Only accessed by Admin but keeping logical fallback
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchBonuses();
        if (role === 'admin') fetchEmployees();
    }, [role]);

    const fetchBonuses = async () => {
        try {
            const response = await api.get('/bonuses');
            setBonuses(response.data);
        } catch (error) {
            console.error('Error fetching bonuses', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
            if(response.data.length > 0) {
                setNewBonus(prev => ({...prev, employee_id: response.data[0].id}));
            }
        } catch (error) {
            console.error('Error fetching employees', error);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bonuses', newBonus);
            setShowModal(false);
            setNewBonus({ employee_id: employees.length > 0 ? employees[0].id : '', bonus_amount: '', bonus_reason: '' });
            fetchBonuses();
            alert('Bonus assigned successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to assign bonus');
        }
    };


    if (loading) return <div>Loading...</div>;

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Incentive Allocation</h2>
                    <p className="text-muted small">Manage performance bonuses and reward distributions.</p>
                </div>
                {role === 'admin' && (
                    <button className="btn btn-primary px-4" onClick={() => setShowModal(true)}>Initiate Allocation</button>
                )}
            </div>

            <div className="glass-card">
                <BonusTable bonuses={bonuses} isAdmin={role === 'admin'} />
            </div>

            {/* Admin Assign Modal */}
            {showModal && role === 'admin' && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="glass-card" style={{width: '500px', maxWidth: '95%', padding: '2.5rem'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="m-0" style={{fontWeight: '700', color: '#1e293b'}}>Distribute Incentive</h4>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleAssign}>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Target Identification</label>
                                <select className="form-select bg-light border-light" style={{borderRadius: '10px'}} value={newBonus.employee_id} onChange={e => setNewBonus({...newBonus, employee_id: e.target.value})} required>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Allocation Magnitude ($)</label>
                                <input type="number" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newBonus.bonus_amount} onChange={e => setNewBonus({...newBonus, bonus_amount: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Issuance Rationale</label>
                                <textarea className="form-control bg-light border-light" style={{borderRadius: '10px'}} rows="2" value={newBonus.bonus_reason} onChange={e => setNewBonus({...newBonus, bonus_reason: e.target.value})} required></textarea>
                            </div>
                            <div className="d-flex gap-2 mt-5">
                                <button type="submit" className="btn btn-primary flex-grow-1" style={{fontWeight: '600'}}>Commit Distribution</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BonusManagement;

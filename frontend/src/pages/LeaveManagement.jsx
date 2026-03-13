import React, { useState, useEffect } from 'react';
import api from '../api/api';

import LeaveTable from '../components/LeaveTable';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newLeave, setNewLeave] = useState({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
    
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves');
            setLeaves(response.data);
        } catch (error) {
            console.error('Error fetching leaves', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', newLeave);
            setShowModal(false);
            setNewLeave({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
            fetchLeaves();
            alert('Leave application submitted!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit leave');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Leave & Absence</h2>
                    <p className="text-muted small">Coordinate temporal hiatus and personal time tracking.</p>
                </div>
                {role === 'employee' && (
                    <button className="btn btn-primary px-4" onClick={() => setShowModal(true)}>Request Hiatus</button>
                )}
            </div>

            <div className="glass-card">
                <LeaveTable leaves={leaves} isAdmin={role === 'admin'} onStatusUpdate={handleStatusUpdate} />
            </div>

            {/* Employee Apply Modal */}
            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="glass-card" style={{width: '560px', maxWidth: '95%', padding: '2.5rem'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="m-0" style={{fontWeight: '700', color: '#1e293b'}}>Temporal Request</h4>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleApply}>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Leave Classification</label>
                                <select className="form-select bg-light border-light" style={{borderRadius: '10px'}} value={newLeave.leave_type} onChange={e => setNewLeave({...newLeave, leave_type: e.target.value})}>
                                    <option value="Sick">Medical/Sick Recovery</option>
                                    <option value="Vacation">Annual Sabbatical/Vacation</option>
                                    <option value="Personal">Personal/Critical Emergency</option>
                                </select>
                            </div>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Start Signature</label>
                                    <input type="date" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newLeave.start_date} onChange={e => setNewLeave({...newLeave, start_date: e.target.value})} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">End Signature</label>
                                    <input type="date" className="form-control bg-light border-light" style={{borderRadius: '10px'}} value={newLeave.end_date} onChange={e => setNewLeave({...newLeave, end_date: e.target.value})} required />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Context Description</label>
                                <textarea className="form-control bg-light border-light" style={{borderRadius: '10px'}} rows="3" value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} required></textarea>
                            </div>
                            <div className="d-flex gap-2 mt-5">
                                <button type="submit" className="btn btn-primary flex-grow-1" style={{fontWeight: '600'}}>Submit Request</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;

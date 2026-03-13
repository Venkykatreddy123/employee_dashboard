import React, { useState, useEffect } from 'react';
import api from '../api/api';

import AttendanceTable from '../components/AttendanceTable';

const Attendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [manualLog, setManualLog] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], check_in: '', check_out: '' });
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchAttendance();
        if (role === 'admin' || role === 'manager') fetchEmployees();
    }, [role]);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) { console.error('Error fetching employees', error); }
    };

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await api.post('/attendance/checkin');
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to check in');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await api.post('/attendance/checkout');
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to check out');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance/manual', manualLog);
            setShowManualModal(false);
            fetchAttendance();
            alert('Manual entry recorded.');
        } catch (error) { alert(error.response?.data?.error || 'Failed'); }
    }

    if (loading) return <div>Loading...</div>;

    const hasActiveShift = role === 'employee' && records.some(r => !r.check_out && r.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Attendance Management</h2>
                    <p className="text-muted small">Monitor real-time shifts and historical telemetry.</p>
                </div>
                
                <div className="d-flex gap-3">
                    {(role === 'admin' || role === 'manager') && (
                        <button className="btn btn-outline-info" onClick={() => setShowManualModal(true)}>
                            Manual Override
                        </button>
                    )}
                    {role === 'employee' && (
                        !hasActiveShift ? (
                            <button className="btn btn-primary px-4" onClick={handleCheckIn} disabled={actionLoading}>
                                {actionLoading ? 'Initializing...' : 'Clock In System'}
                            </button>
                        ) : (
                            <button className="btn btn-danger px-4" onClick={handleCheckOut} disabled={actionLoading}>
                                {actionLoading ? 'Terminating...' : 'Clock Out System'}
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="glass-card">
                <AttendanceTable records={records} isAdmin={role === 'admin' || role === 'manager'} />
            </div>

            {/* Manual Override Modal */}
            {showManualModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content glass-card p-4">
                            <h4 className="mb-4">Manual Entry Correction</h4>
                            <form onSubmit={handleManualSubmit}>
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Employee</label>
                                    <select className="form-select bg-light border-light" value={manualLog.employee_id} onChange={e => setManualLog({...manualLog, employee_id: e.target.value})} required>
                                        <option value="">Select Target...</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Log Date</label>
                                    <input type="date" className="form-control bg-light border-light" value={manualLog.date} onChange={e => setManualLog({...manualLog, date: e.target.value})} required />
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Check In</label>
                                        <input type="time" className="form-control bg-light border-light" value={manualLog.check_in} onChange={e => setManualLog({...manualLog, check_in: e.target.value})} required />
                                    </div>
                                    <div className="col">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Check Out</label>
                                        <input type="time" className="form-control bg-light border-light" value={manualLog.check_out} onChange={e => setManualLog({...manualLog, check_out: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-5">
                                    <button type="submit" className="btn btn-primary flex-grow-1">Commit Entry</button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowManualModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

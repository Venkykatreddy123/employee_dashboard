import React, { useState, useEffect } from 'react';
import api from '../api/api';

const BreakTracker = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [category, setCategory] = useState('Personal');
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchBreaks();
    }, []);

    const fetchBreaks = async () => {
        try {
            const response = await api.get('/breaks');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching breaks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartBreak = async () => {
        setActionLoading(true);
        try {
            await api.post('/breaks/start', { category });
            fetchBreaks();
            alert('Break started.');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to start break');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndBreak = async () => {
        setActionLoading(true);
        try {
            const res = await api.post('/breaks/end');
            fetchBreaks();
            alert(`Break ended. Duration: ${res.data.break_duration.toFixed(0)} minutes`);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to end break');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    const hasActiveBreak = role === 'employee' && records.some(r => !r.break_end && r.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Break Management</h2>
                    <p className="text-muted small">Efficiently manage recovery periods and break cycles.</p>
                </div>
                
                {role === 'employee' && (
                    <div className="d-flex gap-3 align-items-center">
                        {!hasActiveBreak ? (
                            <>
                                <select 
                                    className="form-select bg-light border-light" 
                                    style={{width: '180px', borderRadius: '12px'}}
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="Lunch">Lunch Break</option>
                                    <option value="Coffee">Coffee Break</option>
                                    <option value="Personal">Personal Time</option>
                                </select>
                                <button className="btn btn-warning px-4" style={{fontWeight: '600'}} onClick={handleStartBreak} disabled={actionLoading}>
                                    {actionLoading ? 'Initiating...' : 'Initialize Break'}
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary px-4" style={{fontWeight: '600'}} onClick={handleEndBreak} disabled={actionLoading}>
                                {actionLoading ? 'Resuming...' : 'End Active Break'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="glass-card">
                <table className="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            {(role === 'admin' || role === 'manager') && <th>Employee Identity</th>}
                            <th>Log Date</th>
                            <th>Classification</th>
                            <th>Start Signature</th>
                            <th>End Signature</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.id}>
                                {(role === 'admin' || role === 'manager') && <td className="fw-bold" style={{color: 'var(--primary)'}}>{record.name}</td>}
                                <td>{record.date}</td>
                                <td><span className="badge badge-info">{record.category || 'Personal'}</span></td>
                                <td>{new Date(record.break_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                <td>{record.break_end ? new Date(record.break_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                                <td>
                                    {record.break_duration 
                                        ? <span className="badge badge-success" style={{fontSize: '0.9rem'}}>{record.break_duration.toFixed(0)}m</span>
                                        : <span className="badge badge-warning" style={{fontSize: '0.9rem'}}>In Transition</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {records.length === 0 && <div className="text-center p-5 text-muted">No break telemetry recorded in current cycle.</div>}
            </div>
        </div>
    );
};

export default BreakTracker;

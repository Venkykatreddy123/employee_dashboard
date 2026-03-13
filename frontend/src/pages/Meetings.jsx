import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ meeting_subject: '', classification: 'Internal' });
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await api.get('/meetings');
            setMeetings(response.data);
        } catch (error) {
            console.error('Error fetching meetings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMeeting = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/meetings/start', { ...newMeeting, start_time: new Date().toISOString() });
            setNewMeeting({ meeting_subject: '', classification: 'Internal' });
            fetchMeetings();
            alert('Meeting started.');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to start meeting');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndMeeting = async () => {
        setActionLoading(true);
        try {
            const res = await api.post('/meetings/end');
            fetchMeetings();
            alert(`Meeting ended. Duration: ${(res.data.duration * 60).toFixed(0)} minutes`);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to end meeting');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    const hasActiveMeeting = meetings.some(m => !m.end_time && m.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Meeting Log</h2>
                    <p className="text-muted small">Collaborative session tracking and classification.</p>
                </div>
                
                <div className="d-flex gap-2">
                    {!hasActiveMeeting ? (
                        <form className="d-flex gap-3 align-items-center" onSubmit={handleStartMeeting}>
                            <input 
                                type="text" 
                                className="form-control bg-light border-light" 
                                style={{width: '280px', borderRadius: '12px'}}
                                placeholder="Session Subject..." 
                                value={newMeeting.meeting_subject} 
                                onChange={e => setNewMeeting({...newMeeting, meeting_subject: e.target.value})} 
                                required 
                            />
                            <select 
                                className="form-select bg-light border-light" 
                                style={{width: '160px', borderRadius: '12px'}}
                                value={newMeeting.classification} 
                                onChange={e => setNewMeeting({...newMeeting, classification: e.target.value})}
                            >
                                <option value="Internal">Internal</option>
                                <option value="Client">Client</option>
                                <option value="Sync">Daily Sync</option>
                            </select>
                            <button className="btn btn-primary px-4" type="submit" disabled={actionLoading} style={{fontWeight: '600'}}>
                                {actionLoading ? '...' : 'Launch Meeting'}
                            </button>
                        </form>
                    ) : (
                        <button className="btn btn-danger px-4" onClick={handleEndMeeting} disabled={actionLoading} style={{fontWeight: '600'}}>
                            {actionLoading ? 'Terminating...' : 'Conclude Active Session'}
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-card">
                <table className="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            {(role === 'admin' || role === 'manager') && <th>Employee Context</th>}
                            <th>Session Subject</th>
                            <th>Classification</th>
                            <th>Initialization</th>
                            <th>Net Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.map(m => (
                            <tr key={m.id}>
                                {(role === 'admin' || role === 'manager') && <td className="fw-bold" style={{color: 'var(--primary)'}}>{m.name}</td>}
                                <td>{m.meeting_subject}</td>
                                <td><span className="badge badge-info">{m.classification}</span></td>
                                <td>{new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                <td>
                                    {m.duration 
                                        ? <span className="badge badge-success">{(m.duration * 60).toFixed(0)}m</span>
                                        : <span className="badge badge-warning">Active Session</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {meetings.length === 0 && <div className="text-center p-5 text-muted">No collaborative telemetry found.</div>}
            </div>
        </div>
    );
};

export default Meetings;

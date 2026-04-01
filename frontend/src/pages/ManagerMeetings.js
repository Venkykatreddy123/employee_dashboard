import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Clock, Link as LinkIcon, Users, Plus, CheckCircle } from 'lucide-react';

const ManagerMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        participants: []
    });
    const [loading, setLoading] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [meetingRes, userRes] = await Promise.all([
                api.get('/meetings/manager'),
                api.get('/users')
            ]);
            setMeetings(meetingRes.data);
            // Filter out non-employees if needed, or just show all
            setEmployees(userRes.data.filter(u => u.role === 'employee'));
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, participants: selectedOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/meetings', formData);
            alert('Protocol established. Meeting sync link initialized.');
            setFormData({ title: '', description: '', date: '', time: '', meeting_link: '', participants: [] });
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error scheduling meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-3">
            <div className="mb-4">
                <h4 className="fw-bold mb-1">Strategic Workspace Sync</h4>
                <p className="text-secondary small">Coordinate operational alignment and team collaborations.</p>
            </div>

            <div className="row g-4">
                {/* Creation Form */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                           <Plus size={20} className="text-primary" /> Initialize Sync
                        </h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Session Title</label>
                                <input type="text" name="title" className="form-control" required value={formData.title} onChange={handleChange} placeholder="e.g. Weekly Protocol Review" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Description</label>
                                <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange} placeholder="Strategic objectives..."></textarea>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Date</label>
                                    <input type="date" name="date" className="form-control" required value={formData.date} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Time</label>
                                    <input type="time" name="time" className="form-control" required value={formData.time} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Session Link (Optional)</label>
                                <input type="url" name="meeting_link" className="form-control" value={formData.meeting_link} onChange={handleChange} placeholder="https://meet.google.com/xyz" />
                                <div className="form-text small" style={{ fontSize: '0.7rem' }}>Leave blank to auto-generate a Google Meet gateway.</div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold d-flex justify-content-between">
                                    Participants <span className="text-secondary fw-normal">(Ctrl+Click to multi-select)</span>
                                </label>
                                <select multi="true" multiple className="form-select" style={{ height: '120px' }} value={formData.participants} onChange={handleParticipantChange}>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={loading}>
                                {loading ? 'Initializing...' : 'Establish Protocol'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Meetings List */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-4">Operational Schedule</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr className="small text-uppercase">
                                        <th>Session Details</th>
                                        <th>Internal Schedule</th>
                                        <th>Participants</th>
                                        <th>Protocol Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meetings.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-5 text-secondary">No tactical syncs found in the logs.</td></tr>
                                    ) : (
                                        meetings.map(m => (
                                            <tr key={m.id}>
                                                <td>
                                                    <div className="fw-bold">{m.title}</div>
                                                    <div className="small text-secondary">{m.description}</div>
                                                </td>
                                                <td className="small">
                                                    <div className="d-flex align-items-center gap-1"><Calendar size={12}/> {m.date}</div>
                                                    <div className="d-flex align-items-center gap-1"><Clock size={12}/> {m.time}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {m.participants?.map(p => (
                                                            <span key={p.id} className="badge bg-light text-dark border">{p.name}</span>
                                                        )) || <span className="text-secondary small">No participants</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <a href={m.meeting_link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                                                        <LinkIcon size={14}/>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerMeetings;

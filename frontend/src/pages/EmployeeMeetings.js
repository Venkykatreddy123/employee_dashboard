import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Clock, Link as LinkIcon, User } from 'lucide-react';

const EmployeeMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/meetings/employee');
            setMeetings(res.data);
        } catch (err) {
            console.error('Error fetching meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleJoin = (link) => {
        if (!link || !link.startsWith('http')) {
            alert('Security Protocol: Synchronized session link is currently offline or invalid.');
            return;
        }
        window.open(link, "_blank");
    };

    if (loading) return <div className="text-center py-5">Loading operational logs...</div>;

    return (
        <div className="px-4 py-3">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold mb-1">Assigned Collaborations</h4>
                    <p className="text-secondary small">Track assigned tactical syncs and join collaborative sessions.</p>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive p-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-uppercase">
                                <th style={{ width: '30%' }}>Meeting Title</th>
                                <th>Schedule</th>
                                <th>Coordinated By</th>
                                <th className="text-end">Operation Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-5 text-secondary">No assigned strategic sessions at this time.</td></tr>
                            ) : (
                                meetings.map(m => (
                                    <tr key={m.id}>
                                        <td>
                                            <div className="fw-bold">{m.title}</div>
                                            <div className="small text-secondary">{m.description}</div>
                                        </td>
                                        <td className="small">
                                          <div className="d-flex align-items-center gap-1 border-bottom pb-1 mb-1"><Calendar size={12}/> {m.date}</div>
                                          <div className="d-flex align-items-center gap-1 text-primary"><Clock size={12}/> {m.time}</div>
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                              <User size={14} className="text-secondary" />
                                            </div>
                                            <div className="small fw-bold">Manager: {m.manager_name}</div>
                                          </div>
                                        </td>
                                        <td className="text-end">
                                            <button 
                                                onClick={() => handleJoin(m.meeting_link)} 
                                                className={`btn ${m.meeting_link ? 'btn-primary' : 'btn-secondary disabled'} d-inline-flex align-items-center gap-2 px-3 rounded-pill shadow-sm`}
                                            >
                                                <LinkIcon size={14} /> {m.meeting_link ? 'Join Protocol' : 'Protocol Offline'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeMeetings;

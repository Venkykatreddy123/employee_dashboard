import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Calendar, History, Plus, Briefcase, ExternalLink, Users, Download, Activity, Globe } from 'lucide-react';

const demoMeetings = [
    { id: 'M-101', title: 'Sprint Planning', duration: 60, type: 'Internal', created_at: new Date(new Date().setHours(20, 30, 0)).toISOString() },
    { id: 'M-102', title: 'Client Sync', duration: 45, type: 'External', created_at: new Date(new Date().setHours(14, 0, 0)).toISOString() },
    { id: 'M-103', title: 'Product Discussion', duration: 30, type: 'Internal', created_at: new Date(new Date().setHours(16, 30, 0)).toISOString() }
];

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [newMeeting, setNewMeeting] = useState({ title: '', duration: 30, type: 'Internal' });
    const [loading, setLoading] = useState(true);

    const fetchMeetings = async () => {
        try {
            const res = await api.get('/meetings/history');
            setMeetings(res.data);
        } catch (err) {
            console.error('Error fetching meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleLogMeeting = async (e) => {
        e.preventDefault();
        try {
            await api.post('/meetings/log', newMeeting);
            setNewMeeting({ title: '', duration: 30, type: 'Internal' });
            fetchMeetings();
        } catch (err) {
            alert('Failed to log meeting');
        }
    };

    const allMeetings = [...demoMeetings, ...meetings];

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing collaborative records...</div>;

    return (
        <div className="animate-fade">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Collaboration Intelligence</h1>
                    <p className="text-subtitle mb-0">Real-time quantification of synchronic consultation and collaboration focus.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Analytics
                </button>
            </header>

            <div className="grid-2">
                <section className="card card-hover">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary text-white rounded-xl shadow-lg ring-4 ring-primary/5">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Deploy Sync Record</h2>
                            <p className="text-muted mb-0">Input telemetry for a new collaboration event.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleLogMeeting} className="space-y-6">
                        <div className="form-group mb-0">
                            <label className="label-premium">Sync Designation</label>
                            <input
                                type="text"
                                className="form-input py-3"
                                placeholder="e.g. Q3 Technical Roadmap"
                                value={newMeeting.title}
                                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group mb-0">
                                <label className="label-premium">Duration (Min)</label>
                                <input
                                    type="number"
                                    className="form-input py-3"
                                    value={newMeeting.duration}
                                    onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Classification</label>
                                <select 
                                    className="form-input py-3"
                                    value={newMeeting.type}
                                    onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
                                >
                                    <option value="Internal">Internal Sync</option>
                                    <option value="External">External Consultation</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/20">
                            Submit Intelligence Record
                        </button>
                    </form>
                </section>

                <section className="card card-hover">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Active / Recent Cluster</h2>
                            <p className="text-muted mb-0">Latest collaborative nodes in the current cycle.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {allMeetings.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                        {m.type === 'External' ? <Globe size={24} className="text-blue-500" /> : <Users size={24} className="text-purple-500" />}
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-slate-900 leading-tight mb-1">{m.title}</p>
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${m.type === 'External' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {m.type || 'Internal'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none border-l pl-2">
                                                {m.duration} Minutes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Sync Time</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="card">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary/5 text-primary rounded-xl">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Organizational Sync Log</h2>
                        <p className="text-muted mb-0">Immutable record of synchronic consultation events and collaborative duration telemetry.</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Designation</th>
                                <th>Sync Type</th>
                                <th>Global Timestamp</th>
                                <th>Yield Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMeetings.map((m, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                            <span className="font-bold text-slate-900">{m.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter border ${m.type === 'External' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                            {m.type || 'Internal'}
                                        </span>
                                    </td>
                                    <td className="text-slate-600 font-medium text-xs">{new Date(m.created_at).toLocaleString()}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-black text-[10px]">
                                                {m.duration}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutes</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Meetings;

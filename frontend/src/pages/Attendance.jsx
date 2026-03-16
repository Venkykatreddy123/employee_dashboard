import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Play, Square, History, Clock, Activity, Download } from 'lucide-react';

const demoLogs = [
    { id: 'D-101', name: 'Alice Johnson', login_time: new Date(new Date().setHours(9, 0, 0)).toISOString(), logout_time: new Date(new Date().setHours(18, 0, 0)).toISOString(), status: 'Completed' },
    { id: 'D-102', name: 'John Doe', login_time: new Date(new Date().setHours(9, 15, 0)).toISOString(), logout_time: new Date(new Date().setHours(18, 5, 0)).toISOString(), status: 'Completed' },
    { id: 'D-103', name: 'Sarah Williams', login_time: new Date(new Date().setHours(8, 55, 0)).toISOString(), logout_time: null, status: 'Active' }
];

const Attendance = () => {
    const [logs, setLogs] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/attendance/history');
            setLogs(res.data);
            const activeSession = res.data.find(log => !log.logout_time);
            setIsActive(!!activeSession);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/check-in');
            setIsActive(true);
            fetchLogs();
        } catch (err) {
            alert('Failed to check in');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/check-out');
            setIsActive(false);
            fetchLogs();
        } catch (err) {
            alert('Failed to check out');
        }
    };

    const allLogs = [...demoLogs, ...logs];

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing presence records...</div>;

    return (
        <div className="animate-fade">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Presence Intelligence</h1>
                    <p className="text-subtitle mb-0">High-fidelity tracking of organizational availability and session synchronization.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Logs
                </button>
            </header>

            <section className="card card-hover">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl shadow-sm ${isActive ? 'bg-success/10 text-success' : 'bg-slate-50 text-slate-400'}`}>
                            <Clock size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="mb-0">Session Controller</h2>
                                {isActive && <span className="px-2 py-0.5 bg-green-50 text-success text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                                    <Activity size={10} className="animate-pulse" />
                                    Active Stream
                                </span>}
                            </div>
                            <p className="text-muted mb-0">Direct interface for station check-in/out protocols.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {!isActive ? (
                            <button onClick={handleCheckIn} className="btn btn-primary px-10 py-4 text-base shadow-lg shadow-primary/20">
                                <Play size={20} /> Initiate Session
                            </button>
                        ) : (
                            <button onClick={handleCheckOut} className="btn btn-outline border-danger text-danger hover:bg-danger/5 px-10 py-4 text-base">
                                <Square size={20} /> Conclude Stream
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary/5 text-primary rounded-xl">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Historical Telemetry</h2>
                        <p className="text-muted mb-0">Full audit trail of personnel synchronization events across the intelligence grid.</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Personnel Node</th>
                                <th>Sync In</th>
                                <th>Sync Out</th>
                                <th>Telemetry Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allLogs.map((log, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                                                {log.name ? log.name.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{log.name || 'Anonymous Node'}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">CloudOps Authorized</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-slate-600 font-bold">{new Date(log.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="text-slate-600 font-bold">
                                        {log.logout_time ? new Date(log.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                            <span className="text-primary italic">Awaiting sync...</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                            !log.logout_time ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-green-50 text-success border border-green-100'
                                        }`}>
                                            {!log.logout_time ? 'Live Stream' : 'Archive Ready'}
                                        </span>
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

export default Attendance;

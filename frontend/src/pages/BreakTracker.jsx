import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Play, Square, Coffee, Clock, Activity, Download } from 'lucide-react';

const demoBreaks = [
    { id: 'B-101', type: 'Short', start_time: new Date(new Date().setHours(10, 10, 0)).toISOString(), end_time: new Date(new Date().setHours(10, 20, 0)).toISOString(), duration: 10 },
    { id: 'B-102', type: 'Lunch', start_time: new Date(new Date().setHours(13, 0, 0)).toISOString(), end_time: new Date(new Date().setHours(13, 45, 0)).toISOString(), duration: 45 },
    { id: 'B-103', type: 'Personal', start_time: new Date(new Date().setHours(16, 0, 0)).toISOString(), end_time: new Date(new Date().setHours(16, 10, 0)).toISOString(), duration: 10 }
];

const BreakTracker = () => {
    const [breaks, setBreaks] = useState([]);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [reason, setReason] = useState('Lunch');
    const [loading, setLoading] = useState(true);

    const fetchBreaks = async () => {
        try {
            const res = await api.get('/breaks/history');
            setBreaks(res.data);
            const activeBreak = res.data.find(b => !b.end_time);
            setIsOnBreak(!!activeBreak);
        } catch (err) {
            console.error('Error fetching breaks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBreaks();
    }, []);

    const handleStartBreak = async () => {
        try {
            await api.post('/breaks/start', { type: reason });
            setIsOnBreak(true);
            fetchBreaks();
        } catch (err) {
            alert('Failed to start break');
        }
    };

    const handleEndBreak = async () => {
        try {
            await api.post('/breaks/end');
            setIsOnBreak(false);
            fetchBreaks();
        } catch (err) {
            alert('Failed to end break');
        }
    };

    const allBreaks = [...demoBreaks, ...breaks];

    if (loading) return <div className="p-10 text-center text-secondary">Calibrating recuperation telemetry...</div>;

    const getBreakTypeClass = (type) => {
        switch (type.toLowerCase()) {
            case 'lunch': return 'bg-orange-50 text-orange-600 border border-orange-100';
            case 'short': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'meeting': return 'bg-purple-50 text-purple-600 border border-purple-100';
            default: return 'bg-slate-50 text-slate-600 border border-slate-100';
        }
    };

    return (
        <div className="animate-fade">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Recuperation Protocols</h1>
                    <p className="text-subtitle mb-0">Managed synchronization of rest cycles to maintain workforce peak efficiency.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Metrics
                </button>
            </header>

            <section className="card card-hover">
                <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-lg">
                        <div className="flex items-center gap-4 mb-4">
                             <div className={`p-3 rounded-xl shadow-sm ${isOnBreak ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Coffee size={24} />
                             </div>
                             <div>
                                <h2 className="mb-0">Relief Sequence</h2>
                                <p className="text-muted mb-0">Configure and execute authorized pause events.</p>
                             </div>
                        </div>
                        <div className="form-group mt-6">
                            <label className="label-premium">Recuperation Rationale</label>
                            <select 
                                className="form-input py-3" 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={isOnBreak}
                            >
                                <option value="Lunch">Mid-day Refuel Protocol (Lunch)</option>
                                <option value="Short">Brief Cognitive Respite (Short)</option>
                                <option value="Meeting">External Sync Buffer (Meeting)</option>
                                <option value="Personal">Unscheduled Necessity (Personal)</option>
                            </select>
                        </div>
                    </div>
                    <div className="pl-8">
                        {!isOnBreak ? (
                            <button onClick={handleStartBreak} className="btn btn-primary px-10 py-4 text-base shadow-lg shadow-primary/20">
                                <Play size={20} /> Initiate Pause
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <button onClick={handleEndBreak} className="btn btn-outline border-orange-400 text-orange-600 hover:bg-orange-50 px-10 py-4 text-base">
                                    <Square size={20} /> Conclude Relief
                                </button>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest animate-pulse">
                                    <Activity size={12} />
                                    <span>Syncing Rest Data</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary/5 text-primary rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Archived Pauses</h2>
                        <p className="text-muted mb-0">Detailed index of historical recuperation duration and classifications.</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Classification</th>
                                <th>Sequence Start</th>
                                <th>Sequence End</th>
                                <th>Metric / Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allBreaks.map((b, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getBreakTypeClass(b.type)}`}>
                                            {b.type}
                                        </span>
                                    </td>
                                    <td className="text-slate-600 font-bold">{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="text-slate-600 font-bold">
                                        {b.end_time ? new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                            <span className="text-orange-500 italic">Relief active...</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                <Clock size={16} />
                                            </div>
                                            <span className="font-extrabold text-slate-700">{b.duration || '--'} <span className="text-slate-400 font-bold text-xs uppercase ml-1">Min</span></span>
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

export default BreakTracker;

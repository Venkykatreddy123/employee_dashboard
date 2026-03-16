import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Briefcase, Plus, Check, X, Clock, Calendar, Download, Activity } from 'lucide-react';

const demoLeaves = [
    { id: 'L-101', name: 'Alice Johnson', type: 'Sick', start_date: '2024-03-19', end_date: '2024-03-20', reason: 'Medical Checkup', status: 'Approved' },
    { id: 'L-102', name: 'John Doe', type: 'Casual', start_date: '2024-03-25', end_date: '2024-03-25', reason: 'Personal errands', status: 'Pending' },
    { id: 'L-103', name: 'Sarah Williams', type: 'Vacation', start_date: '2024-04-10', end_date: '2024-04-15', reason: 'Annual Leave', status: 'Approved' }
];

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [newLeave, setNewLeave] = useState({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role');

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves/history');
            setLeaves(res.data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves/apply', newLeave);
            setNewLeave({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
            alert('Application submitted for review');
        } catch (err) {
            alert('Failed to submit application');
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status });
            fetchLeaves();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const allLeaves = [...demoLeaves, ...leaves];

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing absence intelligence...</div>;

    const getStatusClass = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-50 text-success border border-green-100';
            case 'Rejected': return 'bg-red-50 text-danger border border-red-100';
            case 'Pending': return 'bg-amber-50 text-warning border border-amber-100';
            default: return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    return (
        <div className="animate-fade">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Absence Intelligence</h1>
                    <p className="text-subtitle mb-0">Managed lifecycle of organizational time-off and deployment buffers.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Registry
                </button>
            </header>

            <section className="card card-hover">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary text-white rounded-xl shadow-lg ring-4 ring-primary/5">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Deploy Absence Application</h2>
                        <p className="text-muted mb-0">Initialize a new time-off sequence for review and scheduling.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid-2">
                        <div className="form-group mb-0">
                            <label className="label-premium">Absence Category</label>
                            <select 
                                className="form-input py-3"
                                value={newLeave.type}
                                onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                            >
                                <option value="Vacation">Standard Recreation Protocol (Vacation)</option>
                                <option value="Sick">Medical Necessity Buffer (Sick)</option>
                                <option value="Personal">Personal Deployment Shift</option>
                                <option value="Maternity">Parental Support Cycle</option>
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="form-group mb-0">
                                <label className="label-premium">Period Initiation</label>
                                <input
                                    type="date"
                                    className="form-input py-3"
                                    value={newLeave.startDate}
                                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Period Conclusion</label>
                                <input
                                    type="date"
                                    className="form-input py-3"
                                    value={newLeave.endDate}
                                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label-premium">Absence Rationale / Context</label>
                        <textarea
                            className="form-input py-3"
                            rows="2"
                            placeholder="Provide operational context for this request..."
                            value={newLeave.reason}
                            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary px-10 py-4 text-base shadow-lg shadow-primary/20">
                            <Check size={18} /> Deploy Application
                        </button>
                    </div>
                </form>
            </section>

            <section className="card">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Application Registry</h2>
                        <p className="text-muted mb-0">Real-time status of lifecycle absence events across the intelligence grid.</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Personnel Node</th>
                                <th>Category</th>
                                <th>Deployment Schedule</th>
                                <th>Registry Status</th>
                                {role === 'admin' && <th>Directives</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {allLeaves.map((l, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                                                {l.name ? l.name.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{l.name || 'Anonymous node'}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Personnel ID: L-{idx+100}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">{l.type}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <Calendar size={14} className="text-primary" />
                                            <span>{new Date(l.start_date).toLocaleDateString()}</span>
                                            <span className="text-slate-300">→</span>
                                            <span>{new Date(l.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getStatusClass(l.status)}`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    {role === 'admin' && l.status === 'Pending' && (
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(l.id, 'Approved')} className="p-2 border border-green-200 text-success hover:bg-green-50 rounded-lg transition-all" title="Approve">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => handleAction(l.id, 'Rejected')} className="p-2 border border-red-200 text-danger hover:bg-red-50 rounded-lg transition-all" title="Reject">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default LeaveManagement;

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, YAxis
} from 'recharts';
import { 
  Play, Square, Activity, History, Download, TrendingUp, Users, 
  CheckCircle, Briefcase, Award, Clock
} from 'lucide-react';

const demoAnalytics = [
    { date: 'Mon', workHours: 7.5, productivityScore: 88 },
    { date: 'Tue', workHours: 8.2, productivityScore: 92 },
    { date: 'Wed', workHours: 7.8, productivityScore: 85 },
    { date: 'Thu', workHours: 9.0, productivityScore: 94 },
    { date: 'Fri', workHours: 8.5, productivityScore: 91 },
    { date: 'Sat', workHours: 4.2, productivityScore: 78 },
    { date: 'Sun', workHours: 0, productivityScore: 0 }
];

const demoActivity = [
    { user: 'Alice Johnson', action: 'Session Start', time: '09:00 AM', status: 'Completed', score: 94 },
    { user: 'John Doe', action: 'Coffee Break', time: '10:15 AM', status: 'Completed', score: 88 },
    { user: 'Sarah Williams', action: 'Client Sync', time: '02:00 PM', status: 'Active', score: 91 },
    { user: 'Alice Johnson', action: 'Session End', time: '06:00 PM', status: 'Completed', score: 95 }
];

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 42,
        activeNow: 12,
        pendingLeaves: 3,
        totalBonuses: 15400
    });
    const [analytics, setAnalytics] = useState(demoAnalytics);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/analytics')
                ]);
                if (statsRes.data.totalEmployees) {
                    setStats(prev => ({...prev, ...statsRes.data}));
                }
                if (analyticsRes.data.length > 0) setAnalytics(analyticsRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCheckIn = () => setIsActive(true);
    const handleCheckOut = () => setIsActive(false);

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing workspace telemetry...</div>;

    return (
        <div className="animate-fade">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Operational Intelligence</h1>
                    <p className="text-subtitle mb-0">Real-time synthesis of workforce deployment and performance velocity.</p>
                </div>
                <div className="flex gap-3">
                     <button className="btn btn-outline">
                         <Download size={16} /> Export Intelligence
                     </button>
                </div>
            </header>

            {/* Elite Widget Grid */}
            <div className="grid-4 mb-8">
                <div className="card card-hover border-t-2 border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-primary rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-success bg-green-50 px-2 py-0.5 rounded-full">+4%</span>
                    </div>
                    <div className="text-3xl font-extrabold mb-1">{stats.totalEmployees}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workforce Capacity</div>
                </div>

                <div className="card card-hover border-t-2 border-success">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 text-success rounded-lg">
                            <Activity size={20} />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse mt-2"></div>
                    </div>
                    <div className="text-3xl font-extrabold mb-1 text-success">{stats.activeNow}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Presence</div>
                </div>

                <div className="card card-hover border-t-2 border-orange-400">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                            <Briefcase size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold mb-1 text-orange-500">{stats.pendingLeaves}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pending Requests</div>
                </div>

                <div className="card card-hover border-t-2 border-purple-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Award size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold mb-1 text-purple-600">
                        ${stats.totalBonuses.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Incentive Volume</div>
                </div>
            </div>

            <div className="grid-2 mb-8">
                {/* Control Center */}
                <section className="card card-hover">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg ring-4 ring-slate-50">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Session Control</h2>
                            <p className="text-muted mb-0">Synchronize your active presence nodes.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={handleCheckIn}
                            className={`btn btn-primary flex-1 py-4 text-base ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isActive}
                        >
                            <Play size={18} /> Initiate Session
                        </button>
                        <button 
                            onClick={handleCheckOut}
                            className={`btn btn-outline flex-1 py-4 text-base ${!isActive ? 'hidden' : ''}`}
                        >
                            <Square size={18} /> Conclude
                        </button>
                    </div>

                    {isActive && (
                        <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between animate-fade">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Activity size={16} className="text-primary animate-pulse" />
                                </div>
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Active Stream</span>
                            </div>
                            <span className="text-xl font-mono font-bold text-primary">02:45:12</span>
                        </div>
                    )}
                </section>

                {/* Performance Sparkline */}
                <section className="card card-hover">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Yield Velocity</h2>
                            <p className="text-muted mb-0">Propulsion score of organizational output.</p>
                        </div>
                    </div>
                    <div className="mt-6" style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer>
                            <LineChart data={analytics}>
                                <Line 
                                    type="monotone" 
                                    dataKey="productivityScore" 
                                    stroke="#2563eb" 
                                    strokeWidth={4} 
                                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* Main Analytics Engine */}
            <section className="card">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Utilization Spectrum</h2>
                            <p className="text-muted mb-0">Engagement density across operational cycles.</p>
                        </div>
                    </div>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={analytics}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                                axisLine={false} 
                                tickLine={false} 
                                dy={10} 
                            />
                            <YAxis 
                                tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                                axisLine={false} 
                                tickLine={false} 
                                dx={-10} 
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px 16px' }} 
                            />
                            <Bar dataKey="workHours" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={48} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Operational Ledger */}
            <section className="card">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                            <History size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Audit Ledger</h2>
                            <p className="text-muted mb-0">Immutable stream of recent organizational mutations.</p>
                        </div>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Operational Actor</th>
                                <th>Sequence Category</th>
                                <th>Sync Time</th>
                                <th>Efficiency Registry</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demoActivity.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                                                {item.user.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{item.user}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Node</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                            item.action.includes('Start') ? 'bg-green-50 text-success border border-green-100' :
                                            item.action.includes('Sync') ? 'bg-blue-50 text-primary border border-blue-100' :
                                            'bg-orange-50 text-orange-600 border border-orange-100'
                                        }`}>
                                            {item.action}
                                        </span>
                                    </td>
                                    <td className="text-[12px] font-bold text-slate-500">{item.time}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                                                    style={{ width: `${item.score}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[12px] font-bold text-primary">{item.score}%</span>
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

export default Dashboard;

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Users, UserPlus, Mail, Briefcase, Calendar, DollarSign, Search, Shield, Activity, Download } from 'lucide-react';

const demoEmployees = [
    { id: 'E-101', name: 'Alice Johnson', email: 'alice.j@cloudops.com', department: 'Engineering', role_name: 'Developer', productivity_score: 94, joining_date: '2023-01-15', role_id: 1 },
    { id: 'E-102', name: 'John Doe', email: 'j.doe@cloudops.com', department: 'Marketing', role_name: 'Analyst', productivity_score: 88, joining_date: '2022-06-20', role_id: 1 },
    { id: 'E-103', name: 'Sarah Williams', email: 'sarah.w@cloudops.com', department: 'HR', role_name: 'Manager', productivity_score: 91, joining_date: '2021-11-05', role_id: 2 }
];

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role_id: 1, department: '', salary: '', joining_date: '', manager_id: ''
    });

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees', formData);
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', role_id: 1, department: '', salary: '', joining_date: '', manager_id: '' });
            fetchEmployees();
            alert('Personnel record initialized successfully');
        } catch (err) {
            alert('Failed to initialize personnel record');
        }
    };

    const allEmployees = [...demoEmployees, ...employees];

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing workforce intelligence...</div>;

    return (
        <div className="animate-fade">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1>Human Infrastructure</h1>
                    <p className="text-subtitle mb-0">Governance and deployment registry of organizational human capital.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-outline">
                        <Download size={16} /> Export Workforce
                    </button>
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className={`btn ${showForm ? 'btn-outline border-danger text-danger' : 'btn-primary shadow-lg shadow-primary/20'}`}
                    >
                        {showForm ? 'Cancel Protocol' : <><UserPlus size={18} /> Initiate Onboarding</>}
                    </button>
                </div>
            </header>

            {showForm && (
                <section className="card card-hover animate-fade border-primary/20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary text-white rounded-xl shadow-lg ring-4 ring-primary/5">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Personnel Onboarding Protocol</h2>
                            <p className="text-muted mb-0">Initialize unique identity and access telemetry for a new workforce node.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid-3">
                            <div className="form-group mb-0">
                                <label className="label-premium">Full Legal Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input py-3" placeholder="Alexander Pierce" required />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Organizational Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input py-3" placeholder="apierce@cloudops.com" required />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Initial Access Phrase</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input py-3" placeholder="••••••••" required />
                            </div>
                        </div>
                        <div className="grid-4">
                            <div className="form-group mb-0">
                                <label className="label-premium">Privilege Tier</label>
                                <select name="role_id" value={formData.role_id} onChange={handleChange} className="form-input py-3">
                                    <option value={1}>Tier 1 (Standard Personnel)</option>
                                    <option value={2}>Tier 2 (Operation Manager)</option>
                                    <option value={3}>Tier 3 (System Administrator)</option>
                                </select>
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Unit / Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} className="form-input py-3" placeholder="Engineering" />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Remuneration ($)</label>
                                <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="form-input py-3" placeholder="85000" />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label-premium">Initiation Date</label>
                                <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className="form-input py-3" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                             <button type="submit" className="btn btn-primary px-12 py-4 text-base shadow-lg shadow-primary/20">
                                Deploy Global Identity
                             </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="card">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="mb-0">Active Workforce Registry</h2>
                        <p className="text-muted mb-0">Centralized log of deployed personnel nodes and their operational telemetry.</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Identity Cluster</th>
                                <th>Unit Designation</th>
                                <th>Privilege Level</th>
                                <th>Efficiency Metric</th>
                                <th>Sync Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allEmployees.map((emp, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-black shadow-md">
                                                {emp.name ? emp.name.charAt(0) : 'E'}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-900 leading-none mb-1 text-sm">{emp.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{emp.department}</span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                            emp.role_id === 3 ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            emp.role_id === 2 ? 'bg-blue-50 text-primary border-blue-100' :
                                            'bg-slate-50 text-slate-400 border-slate-200'
                                        }`}>
                                            {emp.role_name}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px] overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full" 
                                                    style={{ width: `${emp.productivity_score}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-black text-primary text-xs">{emp.productivity_score}%</span>
                                        </div>
                                    </td>
                                    <td className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date(emp.joining_date).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Employees;

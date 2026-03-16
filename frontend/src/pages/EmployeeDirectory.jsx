import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { List, Search, Mail, Phone, MapPin, Briefcase, Calendar, Globe, ArrowRight } from 'lucide-react';

const demoEmployees = [
    { id: 'E-101', name: 'Alice Johnson', email: 'alice.j@cloudops.com', department: 'Engineering', role_name: 'Lead Developer', joining_date: '2023-01-15' },
    { id: 'E-102', name: 'John Doe', email: 'j.doe@cloudops.com', department: 'Marketing', role_name: 'Senior Analyst', joining_date: '2022-06-20' },
    { id: 'E-103', name: 'Sarah Williams', email: 'sarah.w@cloudops.com', department: 'Operations', role_name: 'HR Manager', joining_date: '2021-11-05' }
];

const EmployeeDirectory = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employees');
                setEmployees(res.data);
            } catch (err) {
                console.error('Error fetching directory:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const allEmployees = [...demoEmployees, ...employees];

    const filteredEmployees = allEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing global personnel registry...</div>;

    return (
        <div className="animate-fade">
             <header className="mb-8">
                <h1>Personnel Intelligence</h1>
                <p className="text-subtitle mb-0">Global directory of organizational nodes for cross-unit collaboration.</p>
            </header>

            <section className="card card-hover border-primary/5">
                <div className="relative mb-10">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-primary">
                        <Search size={24} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by identity, functional unit, or role designation..." 
                        className="form-input pl-16 py-6 text-xl font-medium border-slate-100 shadow-sm focus:ring-primary/5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid-3">
                    {filteredEmployees.map((emp, idx) => (
                        <div key={idx} className="card bg-slate-50/30 border-slate-100 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Globe size={20} className="text-slate-200" />
                            </div>
                            
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-primary font-black text-3xl shadow-md border border-slate-100 mb-4 group-hover:scale-110 transition-transform">
                                    {emp.name ? emp.name.charAt(0) : 'E'}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xl text-slate-900 leading-tight mb-1">{emp.name}</h3>
                                    <div className="inline-flex px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10">
                                        {emp.department}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 text-slate-500 group-hover:text-slate-900 transition-colors">
                                    <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Mail size={16} className="text-primary" />
                                    </div>
                                    <span className="text-xs font-bold truncate">{emp.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 group-hover:text-slate-900 transition-colors">
                                     <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Briefcase size={16} className="text-primary" />
                                    </div>
                                    <span className="text-xs font-bold">{emp.role_name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 group-hover:text-slate-900 transition-colors">
                                     <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Calendar size={16} className="text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-tight text-[10px]">Joined {new Date(emp.joining_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <button className="btn btn-primary w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                Protocol Details
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EmployeeDirectory;

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Award, Gift, History, Plus, DollarSign, TrendingUp, Download, Activity, ShieldCheck } from 'lucide-react';

const demoBonuses = [
    { id: 'B-101', name: 'Alice Johnson', bonus_amount: 500, bonus_reason: 'Great performance during Q1 release', date_given: '2024-03-10' },
    { id: 'B-102', name: 'John Doe', bonus_amount: 300, bonus_reason: 'Sales achievement - Client Acquisition', date_given: '2024-03-12' },
    { id: 'B-103', name: 'Sarah Williams', bonus_amount: 400, bonus_reason: 'Team leadership and mentor excellence', date_given: '2024-03-14' }
];

const BonusManagement = () => {
    const [bonuses, setBonuses] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        bonus_amount: '',
        bonus_reason: '',
        date_given: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);

    const fetchBonuses = async () => {
        try {
            const res = await api.get('/bonuses');
            setBonuses(res.data);
        } catch (err) {
            console.error('Error fetching bonuses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBonuses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bonuses', formData);
            setFormData({
                employee_id: '',
                bonus_amount: '',
                bonus_reason: '',
                date_given: new Date().toISOString().split('T')[0]
            });
            fetchBonuses();
            alert('Financial incentive disbursed successfully');
        } catch (err) {
            alert('Incentive disbursement failed');
        }
    };

    const allBonuses = [...demoBonuses, ...bonuses];

    if (loading) return <div className="p-10 text-center text-secondary">Synchronizing financial telemetry...</div>;

    return (
        <div className="animate-fade">
             <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1>Financial Incentives</h1>
                    <p className="text-subtitle mb-0">Quantum disbursement of performance-linked organizational rewards.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Financials
                </button>
            </header>

            <div className="grid-3">
                <section className="card col-span-1 card-hover border-primary/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary text-white rounded-xl shadow-lg ring-4 ring-primary/5">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Deploy Incentive</h2>
                            <p className="text-muted mb-0">Initialize reward sequence for a workforce node.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group mb-0">
                            <label className="label-premium">Personnel Node ID</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="number" name="employee_id" value={formData.employee_id} onChange={handleChange} className="form-input py-3 pl-10" placeholder="Personnel ID (e.g. 102)" required />
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label className="label-premium">Incentive Quantum ($)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary font-bold">
                                    <DollarSign size={18} />
                                </div>
                                <input type="number" name="bonus_amount" value={formData.bonus_amount} onChange={handleChange} className="form-input pl-10 py-3 font-extrabold text-primary" placeholder="1500" required />
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label className="label-premium">Strategic Rationale</label>
                            <textarea name="bonus_reason" value={formData.bonus_reason} rows="4" onChange={handleChange} className="form-input py-3" placeholder="Identify the specific operational victory..." required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/20">
                             Execute Disbursement
                        </button>
                    </form>
                </section>

                <section className="card col-span-2">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="mb-0">Disbursement Registry</h2>
                            <p className="text-muted mb-0">Immutable stream of organizational reward events and performance-linked telemetry.</p>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Recipient Node</th>
                                    <th>Quantum Layer</th>
                                    <th>Sync Date</th>
                                    <th>Incentive Logic</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBonuses.map((b, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
                                                     {b.name ? b.name.charAt(0) : 'R'}
                                                 </div>
                                                 <div>
                                                     <p className="font-extrabold text-slate-900 leading-none mb-1 text-sm">{b.name || 'Anonymous Recipient'}</p>
                                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Verified Workforce node</p>
                                                 </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-success font-black text-base">
                                                <TrendingUp size={16} />
                                                <span>${parseFloat(b.bonus_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                            {new Date(b.date_given).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                        </td>
                                        <td className="text-[11px] font-medium text-slate-500 max-w-[200px] leading-relaxed italic">
                                            "{b.bonus_reason}"
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BonusManagement;

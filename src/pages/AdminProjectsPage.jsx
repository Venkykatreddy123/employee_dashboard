import React, { useState } from 'react';
import { Plus, Search, Calendar, Users, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const projects = [
  { id: 'PRJ001', name: 'NexGen ERP Integration', lead: 'Michael Chen', team: 6, status: 'In Progress', progress: 65, start: 'Jan 2026', end: 'Oct 2026', budget: '$120k' },
  { id: 'PRJ002', name: 'Smart Dash UI Redesign', lead: 'Sarah Miller', team: 4, status: 'In Review', progress: 88, start: 'Feb 2026', end: 'Sep 2026', budget: '$45k' },
  { id: 'PRJ003', name: 'Vibe Mobile App', lead: 'Alex Brown', team: 5, status: 'Completed', progress: 100, start: 'Oct 2025', end: 'Mar 2026', budget: '$80k' },
  { id: 'PRJ004', name: 'Data Analytics Platform', lead: 'Emma Wilson', team: 8, status: 'Planning', progress: 15, start: 'Apr 2026', end: 'Dec 2026', budget: '$200k' },
  { id: 'PRJ005', name: 'HR Self-Service Portal', lead: 'Lisa Park', team: 3, status: 'In Progress', progress: 42, start: 'Mar 2026', end: 'Aug 2026', budget: '$30k' },
];

const statusColors = {
  'In Progress': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'In Review':   'text-amber-500 bg-amber-500/10 border-amber-500/20',
  Completed:     'text-green-500 bg-green-500/10 border-green-500/20',
  Planning:      'text-purple-500 bg-purple-500/10 border-purple-500/20',
};

const progressColors = {
  'In Progress': 'bg-blue-500',
  'In Review':   'bg-amber-500',
  Completed:     'bg-green-500',
  Planning:      'bg-purple-500',
};

const AdminProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const filtered = projects.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Administration</h1>
          <p className="text-gray-400 mt-1">Create projects, assign teams, and track delivery.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold w-fit transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0f0f0f] border border-blue-500/30 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Create New Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Project Name', placeholder: 'e.g. Customer Portal' },
              { label: 'Project Lead', placeholder: 'Lead engineer / manager' },
              { label: 'Budget', placeholder: 'e.g. $50,000' },
              { label: 'Deadline', placeholder: 'Target completion date', type: 'month' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full px-4 py-2.5 bg-[#161616] border border-[#222] rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} placeholder="Describe the project scope..." className="w-full px-4 py-2.5 bg-[#161616] border border-[#222] rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">Create Project</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 bg-[#161616] border border-[#222] text-gray-400 hover:text-white font-bold rounded-xl transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: projects.length, color: 'text-white' },
          { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, color: 'text-blue-500' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: 'text-green-500' },
          { label: 'Planning', value: projects.filter(p => p.status === 'Planning').length, color: 'text-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0f0f0f] border border-[#222] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'In Progress', 'In Review', 'Completed', 'Planning'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-all", statusFilter === s ? 'bg-blue-600 text-white' : 'bg-[#161616] border border-[#222] text-gray-400 hover:text-white')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616]/50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-[#222]">
                <th className="px-6 py-4 font-bold">Project</th>
                <th className="px-6 py-4 font-bold">Lead</th>
                <th className="px-6 py-4 font-bold">Team</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Progress</th>
                <th className="px-6 py-4 font-bold">Timeline</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#161616]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.id} · {p.budget}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{p.lead}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} /> {p.team}</div></td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold border", statusColors[p.status])}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", progressColors[p.status])} style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold w-8 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-xs text-gray-400"><Calendar size={11} /><span>{p.start} → {p.end}</span></div></td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#1a1a1a] rounded-lg text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><ChevronRight size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectsPage;

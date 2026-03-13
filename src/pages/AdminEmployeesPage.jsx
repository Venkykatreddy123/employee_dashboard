import React, { useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Edit3, Trash2, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const employees = [
  { id: 'EMP001', name: 'Sarah Miller', role: 'UI/UX Lead', dept: 'Design', status: 'Active', hours: '38h', joined: 'Jan 2023', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'EMP002', name: 'Michael Chen', role: 'Backend Engineer', dept: 'Engineering', status: 'Active', hours: '42h', joined: 'Mar 2022', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: 'EMP003', name: 'Emma Wilson', role: 'Product Manager', dept: 'Product', status: 'Active', hours: '40h', joined: 'Jun 2021', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: 'EMP004', name: 'David Ross', role: 'Frontend Engineer', dept: 'Engineering', status: 'On Leave', hours: '0h', joined: 'Sep 2023', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'EMP005', name: 'Lisa Park', role: 'Marketing Lead', dept: 'Marketing', status: 'Active', hours: '36h', joined: 'Feb 2022', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
  { id: 'EMP006', name: 'Alex Brown', role: 'DevOps Engineer', dept: 'Engineering', status: 'Active', hours: '44h', joined: 'Nov 2020', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
];

const statusStyle = {
  Active:   'text-green-500 bg-green-500/10',
  'On Leave': 'text-amber-500 bg-amber-500/10',
  Inactive: 'text-red-500 bg-red-500/10',
};

const AdminEmployeesPage = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const depts = ['All', ...new Set(employees.map(e => e.dept))];
  const filtered = employees.filter(e =>
    (deptFilter === 'All' || e.dept === deptFilter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Employee Management</h1>
          <p className="text-gray-400 mt-1">Add, edit, and monitor all employees in your organization.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold w-fit transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: employees.length, color: 'text-white' },
          { label: 'Active', value: employees.filter(e => e.status === 'Active').length, color: 'text-green-500' },
          { label: 'On Leave', value: employees.filter(e => e.status === 'On Leave').length, color: 'text-amber-500' },
          { label: 'Departments', value: new Set(employees.map(e => e.dept)).size, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0f0f0f] border border-[#222] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                deptFilter === d ? 'bg-blue-600 text-white' : 'bg-[#161616] border border-[#222] text-gray-400 hover:text-white'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616]/50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-[#222]">
                <th className="px-6 py-4 font-bold">Employee</th>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Weekly Hours</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#161616]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} className="w-9 h-9 rounded-xl bg-[#222]" alt="" />
                      <div>
                        <p className="text-sm font-semibold text-white">{emp.name}</p>
                        <p className="text-[10px] text-gray-500 italic">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-mono">{emp.id}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{emp.dept}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", statusStyle[emp.status])}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-300 font-semibold">{emp.hours}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{emp.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-2 hover:bg-purple-500/10 rounded-lg text-gray-500 hover:text-purple-500 transition-colors" title="Manage Role">
                        <Shield size={14} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
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

export default AdminEmployeesPage;

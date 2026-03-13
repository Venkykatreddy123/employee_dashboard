import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, Filter, Search, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const initialTasks = [
  { id: 1, title: 'Complete API integration for NexGen ERP', project: 'NexGen ERP', priority: 'High', status: 'In Progress', deadline: 'Mar 15, 2026', description: 'Integrate the REST API endpoints with the frontend dashboard.' },
  { id: 2, title: 'Write unit tests for auth module', project: 'NexGen ERP', priority: 'High', status: 'Pending', deadline: 'Mar 17, 2026', description: 'Cover all edge cases in the authentication flow.' },
  { id: 3, title: 'Design new onboarding screens', project: 'Vibe Mobile', priority: 'Medium', status: 'In Progress', deadline: 'Mar 20, 2026', description: 'Create Figma prototypes for the 3-step onboarding flow.' },
  { id: 4, title: 'Fix dashboard chart rendering bug', project: 'Smart Dash', priority: 'High', status: 'Pending', deadline: 'Mar 14, 2026', description: 'Recharts not re-rendering when data updates on mobile.' },
  { id: 5, title: 'Update user documentation', project: 'Smart Dash', priority: 'Low', status: 'Completed', deadline: 'Mar 10, 2026', description: 'Revise the help center articles with new screenshots.' },
  { id: 6, title: 'Performance audit & optimization', project: 'NexGen ERP', priority: 'Medium', status: 'Completed', deadline: 'Mar 08, 2026', description: 'Identify and resolve slow-loading database queries.' },
];

const priorityConfig = {
  High:   { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertCircle },
  Medium: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  Low:    { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: Circle },
};

const statusConfig = {
  'In Progress': 'text-blue-500 bg-blue-500/10',
  Pending:       'text-amber-500 bg-amber-500/10',
  Completed:     'text-green-500 bg-green-500/10',
};

const TaskCard = ({ task, onStatusChange }) => {
  const PIcon = priorityConfig[task.priority].icon;
  return (
    <div className={cn(
      "bg-[#0f0f0f] border rounded-2xl p-5 flex gap-4 group hover:border-blue-500/30 transition-all",
      task.status === 'Completed' ? 'border-[#1a1a1a] opacity-60' : 'border-[#222]'
    )}>
      <button
        onClick={() => onStatusChange(task.id)}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
      >
        {task.status === 'Completed'
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className={cn("font-semibold text-sm", task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white')}>
            {task.title}
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{task.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", priorityConfig[task.priority].color)}>
            {task.priority}
          </span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusConfig[task.status])}>
            {task.status}
          </span>
          <span className="text-[10px] text-gray-500 font-medium ml-auto">
            Due: {task.deadline}
          </span>
          <span className="text-[10px] text-gray-600">· {task.project}</span>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const toggleStatus = (id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  const filtered = tasks.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter || t.priority === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    pending:    tasks.filter(t => t.status === 'Pending').length,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-gray-400 mt-1">Track and update all your assigned work items.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold w-fit transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-500' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completed, color: 'text-green-500' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0f0f0f] border border-[#222] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'In Progress', 'Pending', 'Completed', 'High'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                filter === f ? 'bg-blue-600 text-white' : 'bg-[#161616] border border-[#222] text-gray-400 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-gray-700" />
            <p className="font-semibold">No tasks match this filter.</p>
          </div>
        )}
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} onStatusChange={toggleStatus} />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;

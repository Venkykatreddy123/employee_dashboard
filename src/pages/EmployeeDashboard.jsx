import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Play, 
  Square,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import useAuthStore from '../store/authStore';
import { cn } from '../lib/utils';

const data = [
  { name: 'Mon', hours: 8.5 },
  { name: 'Tue', hours: 7.2 },
  { name: 'Wed', hours: 9.0 },
  { name: 'Thu', hours: 8.0 },
  { name: 'Fri', hours: 6.5 },
  { name: 'Sat', hours: 2.0 },
  { name: 'Sun', hours: 0 },
];

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-2xl hover:border-blue-500/30 transition-all group overflow-hidden relative">
    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-8 -mt-8 rounded-full", color)}></div>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[#161616] rounded-xl border border-[#222] group-hover:border-blue-500/50 transition-colors">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <div className="flex items-center gap-1 text-green-500 text-xs font-semibold bg-green-500/10 px-2 py-1 rounded-full">
        <TrendingUp size={12} />
        +12.5%
      </div>
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <span className="text-xs text-gray-400 font-medium">{subValue}</span>
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const [isWorking, setIsWorking] = useState(false);
  const [workTime, setWorkTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isWorking) {
      interval = setInterval(() => {
        setWorkTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-300",
            isWorking ? "bg-red-500/10 border-red-500/30 ring-4 ring-red-500/5" : "bg-green-500/10 border-green-500/30 ring-4 ring-green-500/5"
          )}>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Live Session</span>
              <span className="text-xl font-mono font-bold">{formatTime(workTime)}</span>
            </div>
            <button 
              onClick={() => setIsWorking(!isWorking)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
                isWorking ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" : "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20"
              )}
            >
              {isWorking ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Work Hours" value="38.5h" subValue="this week" icon={Clock} color="bg-blue-600" />
        <StatCard title="Active Projects" value="4" subValue="2 due soon" icon={Briefcase} color="bg-purple-600" />
        <StatCard title="Completed Tasks" value="24" subValue="+5 today" icon={CheckCircle2} color="bg-green-600" />
        <StatCard title="Scheduled Meetings" value="3" subValue="next at 2 PM" icon={Calendar} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Chart */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Productivity Trends</h3>
              <p className="text-sm text-gray-500">Your average working hours over the last 7 days.</p>
            </div>
            <div className="flex items-center gap-2 bg-[#161616] p-1 rounded-lg border border-[#333]">
              <button className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white">Weekly</button>
              <button className="px-3 py-1 text-xs font-semibold rounded-md text-gray-400 hover:text-white">Monthly</button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#666', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#666', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '12px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Priority Tasks</h3>
            <button className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600/20 transition-colors">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { id: 1, title: 'API Integration', project: 'NexGen ERP', priority: 'High', status: 'In Progress' },
              { id: 2, title: 'UI Bug Fixes', project: 'Smart Dash', priority: 'Medium', status: 'Pending' },
              { id: 3, title: 'Database Migration', project: 'NexGen ERP', priority: 'High', status: 'Pending' },
              { id: 4, title: 'Code Review', project: 'Vibe Mobile', priority: 'Low', status: 'In Progress' },
            ].map((task) => (
              <div key={task.id} className="p-4 bg-[#161616] border border-[#222] rounded-2xl hover:border-[#333] transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                    task.priority === 'High' ? "text-red-500 bg-red-500/10" : "text-yellow-500 bg-yellow-500/10"
                  )}>
                    {task.priority} Priority
                  </span>
                  <ArrowUpRight size={14} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{task.title}</h4>
                <p className="text-xs text-gray-500">{task.project}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-semibold text-gray-400 hover:text-white bg-[#161616] border border-[#222] rounded-xl transition-all">
            View All Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

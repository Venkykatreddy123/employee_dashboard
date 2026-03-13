import React from 'react';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  Activity,
  UserPlus,
  ArrowUpRight,
  MoreVertical,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn } from '../lib/utils';

const productivityData = [
  { name: 'Engineering', active: 45, completed: 32 },
  { name: 'Design', active: 28, completed: 25 },
  { name: 'Marketing', active: 15, completed: 10 },
  { name: 'Sales', active: 22, completed: 18 },
  { name: 'Support', active: 30, completed: 28 },
];

const projectStatusData = [
  { name: 'On Track', value: 65, color: '#3b82f6' },
  { name: 'At Risk', value: 20, color: '#f59e0b' },
  { name: 'Delayed', value: 15, color: '#ef4444' },
];

const workforceStatusData = [
  { label: 'Active', count: 98, color: 'bg-green-500', text: 'text-green-500' },
  { label: 'Focused', count: 34, color: 'bg-blue-500', text: 'text-blue-500' },
  { label: 'Away', count: 12, color: 'bg-yellow-500', text: 'text-yellow-500' },
  { label: 'On Leave', count: 12, color: 'bg-gray-500', text: 'text-gray-400' },
];

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-2xl relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 -mr-8 -mt-8 rounded-full", color)}></div>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[#161616] rounded-xl border border-[#222]">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <button className="p-1 hover:bg-[#1a1a1a] rounded-lg text-gray-500">
        <MoreVertical size={16} />
      </button>
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      <span className="text-xs text-green-500 font-medium">{subValue}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Organization Overview</h1>
          <p className="text-gray-400 mt-1">Global performance metrics and employee activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value="156" subValue="+12 this month" icon={Users} color="bg-blue-600" />
        <StatCard title="Active Projects" value="42" subValue="+4 this week" icon={Briefcase} color="bg-purple-600" />
        <StatCard title="Tasks Completed" value="1,284" subValue="85% completion rate" icon={CheckSquare} color="bg-green-600" />
        <StatCard title="Avg. Productivity" value="94%" subValue="+2% vs last month" icon={TrendingUp} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity By Department */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Department Performance</h3>
            <select className="bg-[#161616] border border-[#333] text-xs text-gray-400 p-2 rounded-lg outline-none">
              <option>Last 30 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
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
                  cursor={{fill: '#222', opacity: 0.5}}
                />
                <Bar dataKey="active" name="Active Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Health */}
        <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Project Health</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '12px'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-xl font-bold text-white">42</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {projectStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workforce Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {workforceStatusData.map((status) => (
          <div key={status.label} className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl flex items-center justify-between group hover:border-[#333] transition-all">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{status.label}</p>
              <h4 className="text-xl font-bold text-white tracking-tight">{status.count}</h4>
            </div>
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", status.color, "shadow-" + status.color.split('-')[1] + "-500/20 animate-pulse")}></div>
          </div>
        ))}
      </div>

      {/* Employee Login Activity Table */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Live Activity</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Find employee..." 
                className="pl-9 pr-4 py-2 bg-[#161616] border border-[#222] rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:text-blue-400">View All activity</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616]/50 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Employee</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold">Current Status</th>
                <th className="px-6 py-4 font-bold">Session Start</th>
                <th className="px-6 py-4 font-bold">Activity</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {[
                { name: 'Sarah Miller', role: 'UI Lead', dept: 'Design', status: 'Active', start: '09:12 AM', activity: 'Modifying Projects UI', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                { name: 'Michael Chen', role: 'Backend Eng.', dept: 'Engineering', status: 'Active', start: '08:45 AM', activity: 'API Integration', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
                { name: 'Emma Wilson', role: 'UX Designer', dept: 'Design', status: 'Focused', start: '10:00 AM', activity: 'Deep Work Mode', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
                { name: 'David Ross', role: 'Frontend Eng.', dept: 'Engineering', status: 'Away', start: '09:30 AM', activity: 'Lunch Break', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
              ].map((emp, i) => (
                <tr key={i} className="hover:bg-[#161616]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} className="w-8 h-8 rounded-lg bg-[#222]" alt="" />
                      <div>
                        <p className="text-sm font-semibold text-white">{emp.name}</p>
                        <p className="text-[10px] text-gray-500 italic">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{emp.dept}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      emp.status === 'Active' ? "bg-green-500/10 text-green-500" : 
                      emp.status === 'Focused' ? "bg-blue-500/10 text-blue-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-mono">{emp.start}</td>
                  <td className="px-6 py-4 text-xs text-blue-400 font-medium">{emp.activity}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#1a1a1a] rounded-lg text-gray-500 group-hover:text-white transition-colors">
                      <ArrowUpRight size={14} />
                    </button>
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

export default AdminDashboard;

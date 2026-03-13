import React from 'react';
import { 
  Briefcase, 
  Clock, 
  Users, 
  CheckCircle2, 
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Filter,
  Paperclip,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

const projects = [
  {
    id: 1,
    name: 'NexGen ERP Integration',
    description: 'Modernizing the core enterprise resource planning system with cloud-native architecture.',
    status: 'Active',
    progress: 65,
    deadline: 'Oct 24, 2026',
    team: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    ],
    priority: 'High'
  },
  {
    id: 2,
    name: 'Smart Dash UI Redesign',
    description: 'Refreshing the dashboard interface with glassmorphism and modern design principles.',
    status: 'In Review',
    progress: 88,
    deadline: 'Sep 12, 2026',
    team: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    ],
    priority: 'Medium'
  },
  {
    id: 3,
    name: 'Vibe Mobile App',
    description: 'Cross-platform mobile application for internal communication and project tracking.',
    status: 'Completed',
    progress: 100,
    deadline: 'Aug 05, 2026',
    team: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
    ],
    priority: 'Low'
  }
];

const ProjectsPage = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assigned Projects</h1>
          <p className="text-gray-400 mt-1">Manage and track your project contributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161616] border border-[#222] text-gray-400 rounded-xl hover:text-white transition-all transition-all">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl flex flex-col group hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                project.status === 'Completed' ? "bg-green-500/10 text-green-500" :
                project.status === 'In Review' ? "bg-orange-500/10 text-orange-500" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {project.status}
              </span>
              <button className="p-1 text-gray-500 hover:text-white">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-6">
              {project.description}
            </p>

            <div className="space-y-4 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-bold">{project.progress}%</span>
                </div>
                <div className="h-2 bg-[#161616] rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      project.progress === 100 ? "bg-green-500" : "bg-blue-600"
                    )}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-y border-[#222]">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-xs font-medium">{project.deadline}</span>
                </div>
                <div className="flex -space-x-2">
                  {project.team.map((avatar, i) => (
                    <img 
                      key={i} 
                      src={avatar} 
                      className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] ring-1 ring-[#222]" 
                      alt="" 
                    />
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-[#161616] flex items-center justify-center text-[10px] font-bold text-gray-400">
                    +2
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                  <MessageSquare size={16} />
                  <span className="text-xs">12</span>
                </div>
                <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                  <Paperclip size={16} />
                  <span className="text-xs">5</span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors">
                Details
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;

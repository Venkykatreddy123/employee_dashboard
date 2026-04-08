import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { 
  Video, Plus, Calendar, Clock, Bookmark, Search, Filter, 
  Trash2, Edit2, CheckCircle, AlertCircle, RefreshCw, X, MoreVertical, ExternalLink, Users, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingsLog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    scheduled_time: new Date().toISOString().slice(0, 16), 
    duration: 30,
    meeting_link: '',
    participants: [] 
  });
  
  const canManage = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/meetings');
      if (response.data.success) {
        setMeetings(response.data.data);
      }
    } catch (err) {
      console.error('Meetings Fetch Failure:', err);
      toast.error('Failed to sync meeting data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (err) {
      console.error('Employee fetch failure');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        navigate('/login');
        return;
    }

    fetchMeetings();
    fetchEmployees();

    socket.on('meeting-created', (newMeeting) => {
      setMeetings(prev => [newMeeting, ...prev]);
      toast('New meeting scheduled!', { icon: '📅', style: { borderRadius: '12px' } });
    });

    socket.on('meeting-updated', ({ meeting_id, status }) => {
      setMeetings(prev => prev.map(m => m.id === meeting_id ? { ...m, status } : m));
    });

    return () => {
      socket.off('meeting-created');
      socket.off('meeting-updated');
    };
  }, [fetchMeetings, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/meetings/create', { 
        ...formData, 
        created_by: user.emp_id 
      });
      
      if (response.data.success) {
        toast.success('Meeting scheduled successfully');
        setShowModal(false);
        
        if (formData.meeting_link && formData.meeting_link.startsWith('http')) {
           window.open(formData.meeting_link, '_blank');
        }
        
        setFormData({
          title: '', description: '',
          scheduled_time: new Date().toISOString().slice(0, 16),
          duration: 30, meeting_link: '', participants: []
        });
        fetchMeetings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create meeting');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await api.delete(`/api/meetings/${id}`);
        toast.success('Meeting deleted');
        setMeetings(prev => prev.filter(m => m.id !== id));
      } catch (err) {
        toast.error('Failed to delete meeting');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'live': return <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-red-100 animate-pulse">Live Now</span>;
      case 'ended': return <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">Ended</span>;
      default: return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">Scheduled</span>;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Meetings & Collaboration</h1>
          <p className="text-slate-500 mt-1 font-medium text-left">Connect with your team and manage upcoming sessions.</p>
        </div>
        
        {canManage && (
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            Schedule Meeting
          </button>
        )}
      </div>

      <div className="space-y-8 text-left">
         {/* Meetings Toolbar */}
         <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
               <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input placeholder="Search meetings..." className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 transition-all" />
               </div>
            </div>
            <button onClick={fetchMeetings} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 ml-4">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>

         {/* Meetings Grid */}
         {loading && meetings.length === 0 ? (
            <div className="py-48 text-center flex flex-col items-center gap-4">
               <RefreshCw className="animate-spin text-indigo-600" size={48} />
               <p className="text-slate-500 font-medium">Loading session list...</p>
            </div>
         ) : meetings.length === 0 ? (
            <div className="py-48 text-center flex flex-col items-center gap-6 opacity-30">
               <Video size={84} strokeWidth={1} text-slate-300 />
               <h3 className="text-2xl font-bold text-slate-900">No meetings scheduled</h3>
               <p className="text-slate-500 max-w-xs mx-auto">Click "Schedule Meeting" to start collaborating with your team.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {meetings.map((meeting) => (
                  <motion.div 
                    key={meeting.id} 
                    layoutId={meeting.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col group overflow-hidden"
                  >
                     <div className="p-6 space-y-4 flex-1">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Calendar size={20} />
                           </div>
                           <div className="flex gap-2">
                              {getStatusBadge(meeting.status)}
                              {canManage && (
                                 <button onClick={() => handleDelete(meeting.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                              )}
                           </div>
                        </div>

                        <div className="space-y-1">
                           <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{meeting.title}</h3>
                           <p className="text-slate-500 text-sm font-medium line-clamp-2">{meeting.description || 'No agenda provided for this session.'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 mt-2">
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Clock size={16} className="text-indigo-500" />
                              <span className="text-xs font-bold uppercase tracking-wider">{meeting.duration} Mins</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Users size={16} className="text-indigo-500" />
                              <span className="text-xs font-bold uppercase tracking-wider">{meeting.participant_count || 0} Attending</span>
                           </div>
                        </div>
                     </div>

                     <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                           <div className="w-8 h-8 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[10px] font-black text-slate-600">
                              {meeting.creator_name?.[0] || 'U'}
                           </div>
                           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{meeting.creator_name || 'System'}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (meeting.meeting_link && meeting.meeting_link.startsWith('http') && !meeting.meeting_link.includes(`/meetings/${meeting.id}`)) {
                              window.open(meeting.meeting_link, '_blank');
                            } else {
                              navigate(`/meetings/${meeting.id}`);
                            }
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                        >
                          Join <ExternalLink size={12} />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>

      {/* Meeting Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm px-4"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule Meeting</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all" placeholder="e.g. Design Sync" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Scheduled Time</label>
                    <input required type="datetime-local" value={formData.scheduled_time} onChange={e => setFormData({...formData, scheduled_time: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                    <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Link (Optional)</label>
                    <input type="text" value={formData.meeting_link} onChange={e => setFormData({...formData, meeting_link: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all" placeholder="Zoom, Meet, or leave blank" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-left block">Select Participants</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px]">
                    {employees.filter(e => e.emp_id !== user.emp_id).map(emp => (
                      <button
                        key={emp.emp_id}
                        type="button"
                        onClick={() => {
                          const exists = formData.participants.find(p => p.employee_id === emp.emp_id);
                          if (exists) {
                            setFormData({...formData, participants: formData.participants.filter(p => p.employee_id !== emp.emp_id)});
                          } else {
                            setFormData({...formData, participants: [...formData.participants, { employee_id: emp.emp_id, role: 'employee' }]});
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          formData.participants.find(p => p.employee_id === emp.emp_id)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-600 hover:text-indigo-600'
                        }`}
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agenda / Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all resize-none" placeholder="What is this meeting about?"></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                   <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest text-xs">Schedule Session</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingsLog;

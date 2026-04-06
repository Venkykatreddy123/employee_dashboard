import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, MessageSquare, Send, LogOut, Video, 
  Clock, Share2, Play, Square, User, Shield, Info, Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingRoom = () => {
  const { meeting_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const isAdmin = ['Admin', 'HR', 'Manager'].includes(user?.role) || meeting?.created_by === user?.emp_id;

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const response = await api.get(`/api/meetings/${meeting_id}`);
        if (response.data.success) {
          setMeeting(response.data.data);
          setParticipants(response.data.data.participants || []);
          setMessages(response.data.data.messages || []);
        }
      } catch (err) {
        toast.error('Strategic terminal access denied');
        navigate('/meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();

    // Socket Interactions
    socket.emit('join-room', { meeting_id, user });

    socket.on('participants-update', (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    socket.on('receive-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socket.on('user-joined', ({ user: joinedUser }) => {
      toast(`${joinedUser.name} synchronized with terminal`, { icon: '👤', style: { borderRadius: '20px', background: '#333', color: '#fff' } });
    });

    socket.on('user-left', ({ user: leftUser }) => {
      toast(`${leftUser.name} disconnected from session`, { icon: '🚪' });
    });

    socket.on('meeting-updated', ({ status }) => {
      setMeeting(prev => ({ ...prev, status }));
      if (status === 'ended') {
        toast.error('Session decommissioning initiated by Admin.');
      }
    });

    return () => {
      socket.emit('leave-room', { meeting_id, user });
      socket.off('participants-update');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('meeting-updated');
    };
  }, [meeting_id, user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('send-message', {
      meeting_id,
      sender_id: user.emp_id,
      sender_name: user.name,
      message: newMessage
    });

    setNewMessage('');
  };

  const updateStatus = (newStatus) => {
    socket.emit('update-meeting-status', { meeting_id, status: newStatus });
    toast.success(`Protocol state: ${newStatus.toUpperCase()}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Terminal link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Video size={60} className="animate-pulse text-indigo-500 mb-8" />
        <h2 className="text-2xl font-black uppercase tracking-[0.5em] italic">Accessing Encryption Layer...</h2>
      </div>
    );
  }

  return (
    <div className="h-[90vh] flex flex-col bg-slate-950 text-white rounded-[40px] overflow-hidden border border-slate-800 shadow-5xl m-4">
      {/* Header */}
      <div className="p-8 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl ${meeting.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'} shadow-2xl`}>
            <Video size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">{meeting.title}</h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className={`px-3 py-1 rounded-full ${meeting.status === 'live' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                 {meeting.status}
               </span>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
               <Clock size={12} className="text-indigo-400" />
               {meeting.duration} Minutes Session
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={copyLink} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-inner text-slate-400" title="Copy Link">
            <Copy size={20} />
          </button>
          
          {isAdmin && meeting.status === 'scheduled' && (
            <button 
              onClick={() => updateStatus('live')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs italic flex items-center gap-3 shadow-3xl shadow-indigo-500/20"
            >
              <Play size={16} /> Start Protocol
            </button>
          )}

          {isAdmin && meeting.status === 'live' && (
            <button 
              onClick={() => updateStatus('ended')}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs italic flex items-center gap-3 shadow-3xl shadow-red-500/20"
            >
              <Square size={16} /> End Session
            </button>
          )}

          <button 
            onClick={() => navigate('/meetings')}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl transition-all uppercase tracking-widest text-xs italic flex items-center gap-3 shadow-sm border border-slate-700"
          >
            <LogOut size={16} /> Eject
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Side Panel */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-8 overflow-y-auto hidden lg:block">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Active Nodes</h3>
              <span className="bg-slate-800 text-[10px] px-3 py-1 rounded-full font-black">{participants.length}</span>
           </div>
           
           <div className="space-y-6">
              {participants.map((participant) => (
                <div key={participant.employee_id} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden shadow-lg group-hover:border-indigo-500 transition-colors">
                      {participant.profile_image ? (
                        <img src={participant.profile_image} alt={participant.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-500" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900 animate-pulse" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-black uppercase tracking-widest truncate">{participant.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">{participant.role || participant.designation || 'Observer'}</p>
                  </div>
                  {participant.role === 'admin' && <Shield size={12} className="text-indigo-500 ml-auto" />}
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 bg-slate-900 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-4 text-slate-400 mb-4">
                 <Info size={16} className="text-indigo-500" />
                 <p className="text-[10px] font-black uppercase tracking-widest tracking-tighter">Session Data</p>
              </div>
              <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">
                Terminal ID: {meeting_id}<br/>
                Encryption: RSA-4096-ECC<br/>
                Link: Turso-Synchronized
              </p>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950/30 backdrop-blur-3xl relative">
           <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none z-10" />
           
           <div 
            ref={scrollRef}
            className="flex-1 p-10 overflow-y-auto space-y-8 scroll-smooth custom-scrollbar relative z-0"
           >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30 select-none">
                   <MessageSquare size={100} className="mb-6" />
                   <p className="text-2xl font-black uppercase tracking-[1em] italic">Protocol Empty</p>
                   <p className="text-[10px] mt-4 tracking-[0.2em] uppercase font-bold">Secure communications channel established</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex flex-col ${msg.sender_id === user.emp_id ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                       {msg.sender_id !== user.emp_id && (
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{msg.sender_name}</p>
                       )}
                       <p className="text-[8px] font-bold text-slate-600 uppercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                    <div className={`max-w-[70%] p-6 rounded-3xl font-bold text-xs ring-1 ring-white/5 shadow-2xl relative ${
                      msg.sender_id === user.emp_id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </motion.div>
                ))
              )}
           </div>

           {/* Input Area */}
           <div className="p-8 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-6 bg-slate-950 p-3 rounded-[35px] border-2 border-slate-800 shadow-2xl focus-within:border-indigo-600 transition-all">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Broadcast to terminal protocol..." 
                  className="flex-1 bg-transparent border-none outline-none p-4 font-black text-sm text-white placeholder-slate-600 px-6 italic"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale shadow-3xl shadow-indigo-500/20"
                >
                  <Send size={24} />
                </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;

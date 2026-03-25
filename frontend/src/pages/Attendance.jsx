import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  LogIn, LogOut, Coffee, Play, Clock, Calendar, History, Activity, Timer, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Off-Duty'); // Off-Duty, Checked-In, On-Break

  const isAdminOrHROrManager = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const fetchData = useCallback(async () => {
    if (!user?.emp_id) return;
    try {
      setLoading(true);
      console.log(`📡 Synchronization Handshake: ${user.emp_id} Operational History`);
      
      const response = await axios.get(`/api/attendance/my-history/${user.emp_id}`);
      const historyData = response.data.success ? response.data.data : [];
      setHistory(historyData);
      
      if (isAdminOrHROrManager) {
        const allRes = await axios.get('/api/attendance/all');
        setAllAttendance(allRes.data.success ? allRes.data.data : []);
      }

      // Determine current status from first history item if it's today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = historyData.find(r => r.date === today);
      if (todayRecord) {
        if (todayRecord.check_out) {
          setCurrentStatus('Off-Duty');
        } else {
          setCurrentStatus('Checked-In');
        }
      } else {
        setCurrentStatus('Off-Duty');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Attendance Sync Failure:', err.message);
      setHistory([]);
      setLoading(false);
    }
  }, [user?.emp_id, isAdminOrHROrManager]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action) => {
    if (!user?.emp_id) {
        toast.error('Identity not verified');
        return;
    }
    try {
      let endpoint = '';
      if (action === 'check-in') endpoint = '/api/attendance/check-in';
      else if (action === 'check-out') endpoint = '/api/attendance/check-out';

      const res = await axios.post(endpoint, { emp_id: user.emp_id });
      toast.success(res.data.message);
      
      if (action === 'check-in') setCurrentStatus('Checked-In');
      else if (action === 'check-out') setCurrentStatus('Off-Duty');
      
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operational handshake failed');
    }
  };

  if (!user) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-gray-300 text-3xl">Synchronizing Identity...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Time & Presence</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
             <Activity size={16} className="text-primary-500 animate-pulse" />
             Live Workforce Pulse Monitoring • Role: {user.role}
          </p>
        </div>
        
        <div className="flex items-center gap-6 mt-8 md:mt-0 relative z-10">
           <div className={`px-10 py-5 rounded-[2rem] flex flex-col items-center justify-center min-w-[200px] border shadow-inner transition-all
             ${currentStatus === 'Checked-In' ? 'bg-green-50 text-green-700 border-green-100' : 
               currentStatus === 'Off-Duty' ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-1 opacity-60">Handshake Status</span>
              <span className="text-xl font-black uppercase tracking-tighter leading-none">{currentStatus}</span>
           </div>
           
           <div className="flex gap-4">
              {currentStatus === 'Off-Duty' ? (
                <button 
                  onClick={() => handleAction('check-in')}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-[2rem] shadow-2xl shadow-primary-200 transition-all hover:-translate-y-2 active:scale-95 group"
                  title="Initialize Check-In"
                >
                  <LogIn size={32} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={() => handleAction('check-out')}
                  className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-red-200 transition-all hover:-translate-y-2 active:scale-95 group"
                  title="Initialize Check-Out"
                >
                  <LogOut size={32} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-primary-50/20 px-16 relative">
                 <div className="flex items-center gap-6 z-10">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-200"><Clock size={32} /></div>
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Presence Log</h2>
                       <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2">Validated Operational Cycles</p>
                    </div>
                 </div>
                 <button onClick={fetchData} className="p-4 bg-white text-gray-400 rounded-2xl border border-gray-50 hover:text-primary-600 transition-all shadow-sm"><RefreshCw size={24} className={loading ? 'animate-spin' : ''} /></button>
              </div>
              
              <div className="p-12 flex-1">
                 {loading ? (
                    <div className="space-y-8 animate-pulse">
                       {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-50 rounded-[2.5rem]"></div>)}
                    </div>
                 ) : history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none py-20">
                       <History size={120} className="mb-10 text-gray-200" />
                       <h3 className="text-3xl font-black text-gray-300 uppercase tracking-widest italic">No Presence Logs</h3>
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] mt-2">Operational monitoring active for ID: {user.emp_id}</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {history.map((record, i) => (
                          <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="absolute top-0 left-0 w-2 h-full bg-primary-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                             
                             <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl border-4 border-white shadow-xl flex flex-col items-center justify-center group-hover:bg-primary-50 transition-colors">
                                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter group-hover:text-primary-400 transition-colors">Cycle</span>
                                   <span className="text-xl font-black text-gray-900 tracking-tighter">{record.date.split('-')[2]}</span>
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{new Date(record.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                   <div className="flex items-center gap-3 mt-1">
                                      <div className={`w-2.5 h-2.5 rounded-full ${record.check_out ? 'bg-emerald-500' : 'bg-primary-500 animate-pulse'}`}></div>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Audit Hash {record.id}</p>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex gap-12 items-center">
                                <div className="text-center group/time">
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover/time:text-primary-500 transition-colors">Arrival</p>
                                   <p className="text-xl font-black text-gray-900 tracking-tighter">{record.check_in || '--:--'}</p>
                                </div>
                                <div className="text-center group/time">
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover/time:text-red-500 transition-colors">Departure</p>
                                   <p className="text-xl font-black text-gray-900 tracking-tighter">{record.check_out || '--:--'}</p>
                                </div>
                                <div className="bg-gray-50 px-8 py-4 rounded-[1.5rem] border border-gray-100 shadow-inner group-hover:bg-white transition-colors">
                                   <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Status</p>
                                   <p className="text-md font-black text-gray-900 tracking-tighter">{record.status}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-12">
           <div className="bg-[#0f172a] p-12 rounded-[4.5rem] shadow-4xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
              <div className="relative space-y-12">
                 <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Utilization</h2>
                    <Timer size={40} className="text-primary-400" />
                 </div>
                 
                 <div className="space-y-12">
                    <div className="text-center">
                       <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Total Cycles Observed</p>
                       <p className="text-8xl font-black tracking-tighter text-white">{history.length}</p>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex justify-between items-center group-hover:bg-white/10 transition-all">
                          <div>
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Consistency</p>
                            <p className="text-2xl font-black tracking-tighter">Optimal</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/50"><ChevronRight size={24} /></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden text-center gap-6">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><Activity size={32} className="text-primary-600" /></div>
               <h2 className="text-2xl font-black uppercase tracking-tighter">Handshake Auth</h2>
               <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Individual Personnel Profile Synchronized with Turso Cluster AP-SOUTH-1 Hub for Digital ID: {user.emp_id}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { 
  LogIn, LogOut, Clock, Calendar, History, Activity, Timer, ChevronRight, RefreshCw, User, Search, Filter, ShieldCheck, XCircle, AlertCircle, RotateCcw, TrendingUp, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Offline');
  
  const [adminFilters, setAdminFilters] = useState({ date: '', employee: '' });

  const canSeeAll = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const fetchData = useCallback(async (isClear = false) => {
    try {
      setLoading(true);
      const filtersToUse = isClear ? { date: '', employee: '' } : adminFilters;

      const [todayRes, historyRes] = await Promise.all([
        api.get('/api/attendance/me'),
        api.get('/api/attendance/history')
      ]);

      if (todayRes.data.success) {
        setTodayRecord(todayRes.data.data);
        setCurrentStatus(todayRes.data.data?.status || 'Offline');
      }

      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }

      if (canSeeAll) {
        const queryParams = new URLSearchParams();
        if (filtersToUse.date) queryParams.append('date', filtersToUse.date);
        if (filtersToUse.employee) queryParams.append('emp_id', filtersToUse.employee);
        
        const allRes = await api.get(`/api/attendance/all?${queryParams.toString()}`);
        if (allRes.data.success) {
          setAllAttendance(allRes.data.data);
        }
      }
    } catch (err) {
      console.error('Attendance Sync Failure:', err.message);
      toast.error('Failed to sync attendance data.');
    } finally {
      setLoading(false);
    }
  }, [canSeeAll, adminFilters]);

  useEffect(() => {
    fetchData();
    let interval;
    if (canSeeAll) {
      interval = setInterval(() => fetchData(), 60000); 
    }
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAction = async (action) => {
    try {
      setBtnLoading(true);
      const endpoint = action === 'check-in' ? '/api/attendance/checkin' : '/api/attendance/checkout';
      const res = await api.post(endpoint);
      
      toast.success(res.data.message);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setBtnLoading(false);
    }
  };

  const clearFilters = () => {
    setAdminFilters({ date: '', employee: '' });
    fetchData(true);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-500 font-medium tracking-wide">Initializing secure session...</p>
      </div>
    </div>
  );

  const isCheckedIn = currentStatus === 'Checked In';
  const isCheckedOut = currentStatus === 'Checked Out';

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Professional Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Attendance & Time Tracking</h1>
          <p className="text-slate-500 mt-1 font-medium text-left">Manage your daily work hours and check historical records.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <div className={`w-2.5 h-2.5 rounded-full ml-2 ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-sm font-semibold text-slate-700 mr-2 uppercase tracking-wider">{currentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 text-left">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Quick Actions & Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -4 }}
              className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isCheckedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                   <Clock size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-none">Today's Presence</h3>
                  <p className="text-slate-500 text-sm font-medium mt-2">Logged in as <span className="text-indigo-600 font-bold">{user.name}</span></p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-48">
                <button 
                  disabled={isCheckedIn || isCheckedOut || btnLoading}
                  onClick={() => handleAction('check-in')}
                  className={`w-full px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                    ${(isCheckedIn || isCheckedOut) 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'}`}
                >
                  <LogIn size={20} />
                  Check In
                </button>

                <button 
                  disabled={!isCheckedIn || btnLoading}
                  onClick={() => handleAction('check-out')}
                  className={`w-full px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                    ${(!isCheckedIn) 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 active:scale-95'}`}
                >
                  <LogOut size={20} />
                  Check Out
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-indigo-600 rounded-3xl border border-indigo-500 shadow-xl p-8 text-white flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <p className="text-indigo-100 font-semibold text-sm uppercase tracking-widest">Shift Progress</p>
                <TrendingUp size={20} className="text-indigo-200 opacity-60" />
              </div>
              <div className="mt-4">
                <h4 className="text-4xl font-bold tracking-tighter">
                  {todayRecord?.total_hours ? parseFloat(todayRecord.total_hours).toFixed(1) : '0.0'}
                  <span className="text-xl ml-1 opacity-60 font-medium">Hrs</span>
                </h4>
                <p className="text-indigo-100/70 text-sm mt-1 font-medium">Total recorded for today</p>
              </div>
            </motion.div>
          </div>

          {/* Records Table / List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100"><History size={20} /></div>
                <h2 className="text-xl font-bold text-slate-900">{canSeeAll ? 'Team Attendance Log' : 'My Attendance History'}</h2>
              </div>
              
              <div className="flex items-center gap-3">
                {canSeeAll && (
                  <button onClick={clearFilters} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200" title="Reset Filters">
                    <RotateCcw size={18} />
                  </button>
                )}
                <button onClick={() => fetchData()} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200">
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {canSeeAll && (
              <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      placeholder="Search employee or ID..." 
                      value={adminFilters.employee} 
                      onChange={e => setAdminFilters(prev => ({...prev, employee: e.target.value}))} 
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input 
                      type="date" 
                      value={adminFilters.date} 
                      onChange={e => setAdminFilters(prev => ({...prev, date: e.target.value}))} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Employee</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Date</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Clock In</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Clock Out</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Duration</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(canSeeAll ? allAttendance : history).length > 0 ? (canSeeAll ? allAttendance : history).map((record, i) => (
                    <tr key={record.id || i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            {record.employee_name ? record.employee_name[0] : (user.name[0])}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{record.employee_name || user.name}</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">{record.employee_id || user.emp_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{record.date}</td>
                      <td className="px-8 py-5">
                         <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{record.check_in_time || '--:--'}</span>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{record.check_out_time || '--:--'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <Timer size={14} className="text-indigo-400" />
                           <span className="text-sm font-bold text-indigo-600">
                             {record.total_hours ? parseFloat(record.total_hours).toFixed(2) : '0.00'}<small className="ml-0.5 opacity-60 font-medium tracking-normal text-xs uppercase">hrs</small>
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          record.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          record.status === 'Checked Out' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-32 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Activity size={56} strokeWidth={1.5} />
                          <p className="text-lg font-semibold tracking-tight">No attendance records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Statistics */}
        <div className="space-y-8 text-left">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700" />
            <div className="relative space-y-8">
              <div className="flex items-center gap-3 text-indigo-300">
                <Activity size={18} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Usage Summary</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-5xl font-bold tracking-tight">
                  {canSeeAll ? allAttendance.length : history.length}
                </p>
                <p className="text-slate-400 font-medium text-sm">Total entries processed</p>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Status</span>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Cloud Sync
                 </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Activity Insights</h3>
               <TrendingUp size={16} className="text-indigo-600" />
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival Rating</p>
                     <p className="text-lg font-bold text-slate-900">94.2% <span className="text-[10px] text-emerald-600 ml-1 font-bold">+2.4%</span></p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                     <Users size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Average</p>
                     <p className="text-lg font-bold text-slate-900">8.4 <small className="text-slate-400 font-medium">Hrs/Day</small></p>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <button onClick={() => fetchData()} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-slate-200">
                 <RefreshCw size={14} /> Refresh Terminal
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

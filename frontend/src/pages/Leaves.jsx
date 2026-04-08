import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Calendar, CheckCircle2, XCircle, Trash2, Clock, History, ClipboardList, RefreshCw, AlertCircle, CalendarDays, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaves, addLeave, approveLeave, deleteLeave } from '../services/leavesService';
import toast from 'react-hot-toast';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    reason: ''
  });

  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role);

  const fetchData = useCallback(async () => {
    if (!user?.emp_id) return;
    try {
      setLoading(true);
      const myData = await getLeaves('Employee', user.emp_id);
      setMyLeaves(myData || []);
      
      if (isAdminOrHR) {
        const allData = await getLeaves(user.role);
        setLeaves(allData || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Leave sync failure:', err.message);
      toast.error('Failed to sync leave records');
      setLoading(false);
    }
  }, [user?.emp_id, user?.role, isAdminOrHR]);

  useEffect(() => {
    fetchData();

    socket.on('leaveCreated', fetchData);
    socket.on('leaveUpdated', fetchData);
    socket.on('leaveDeleted', fetchData);

    return () => {
      socket.off('leaveCreated');
      socket.off('leaveUpdated');
      socket.off('leaveDeleted');
    };
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.emp_id) return;
    try {
      const result = await addLeave({
        employee_id: user.emp_id,
        from_date: formData.from_date,
        to_date: formData.to_date,
        reason: formData.reason
      });

      if (result.success) {
        toast.success('Leave request submitted');
        setIsModalOpen(false);
        setFormData({ from_date: '', to_date: '', reason: '' });
        fetchData();
      } else {
        toast.error(result.message || 'Request failed');
      }
    } catch (err) {
       toast.error('Submission failed');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const result = await approveLeave(id, status);
      if (result.success) {
        toast.success(`Leave ${status}`);
        fetchData();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const result = await deleteLeave(id);
      if (result.success) {
        toast.success('Record deleted');
        fetchData();
      } else {
        toast.error('Deletion failed');
      }
    } catch (err) {
      toast.error('Service error');
    }
  };

  if (!user) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <RefreshCw className="animate-spin text-slate-300" size={32} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track your absences and manage team requests.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={fetchData} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} /> Apply for Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Admin Approvals Section */}
        {isAdminOrHR && (
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <ClipboardList size={20} />
               </div>
               <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pending Approval Queue</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && leaves.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-24 text-center text-slate-300 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing requests...</td></tr>
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-24 text-center text-slate-300 italic">No pending leave requests found.</td></tr>
                  ) : leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-sm"> {leave.employee_name?.charAt(0)} </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{leave.employee_name}</p>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1.5">{leave.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                           <CalendarDays size={14} className="text-indigo-400" />
                           {leave.from_date} <span className="text-slate-300 mx-1">→</span> {leave.to_date}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border mt-2 ${
                           leave.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                           leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>{leave.status}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-semibold text-slate-500 line-clamp-1 italic max-w-xs">{leave.reason}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {leave.status === 'Pending' ? (
                                <>
                                    <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} className="p-2.5 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm border border-slate-200 transition-all"><CheckCircle2 size={18} /></button>
                                    <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} className="p-2.5 bg-white text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-slate-200 transition-all"><XCircle size={18} /></button>
                                </>
                            ) : null}
                            <button onClick={() => handleDelete(leave.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-xl shadow-sm border border-slate-200 transition-all"><Trash2 size={18} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My History Section */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 relative">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                    <History size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal History</h2>
              </div>
           </div>

           <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myLeaves.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-300 flex flex-col items-center gap-4 opacity-40">
                   <Calendar size={48} />
                   <p className="text-lg font-semibold">No leave records registered yet</p>
                </div>
              ) : myLeaves.map((leave) => (
                <div key={leave.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all group relative">
                   <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-3xl ${leave.status === 'Approved' ? 'bg-emerald-500' : leave.status === 'Rejected' ? 'bg-rose-500' : 'bg-indigo-500'} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                   
                   <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold uppercase py-1 px-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 tracking-wider">Leave Request</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                         leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>{leave.status}</span>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">From</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{leave.from_date}</p>
                         </div>
                         <div className="w-8 h-[1px] bg-slate-200" />
                         <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">To</p>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{leave.to_date}</p>
                         </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed italic line-clamp-2">"{leave.reason}"</p>
                      
                      {leave.status === 'Pending' && (
                        <button onClick={() => handleDelete(leave.id)} className="w-full py-2.5 text-rose-500 text-[10px] font-bold uppercase tracking-widest border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">Cancel Application</button>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Applied Leave Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm px-4"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <CalendarDays size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for Leave</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-200">
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" required className="form-input-pro" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" required className="form-input-pro" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                  <textarea required className="form-input-pro h-32 resize-none pt-4" placeholder="Briefly explain the reason for your absence..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all uppercase tracking-widest text-xs">Discard</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest text-xs">Submit Application</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .form-input-pro {
           @apply w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-sm;
        }
      `}</style>
    </div>
  );
};

export default Leaves;

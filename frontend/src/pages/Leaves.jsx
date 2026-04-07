import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Calendar, CheckCircle2, XCircle, Trash2, Clock, History, ClipboardList, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaves, addLeave, approveLeave, deleteLeave } from '../services/leavesService';
import toast from 'react-hot-toast';
import socket from '../services/socket';

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
      console.log(`📡 [Leaves] Syncing organizational lifecycle...`);
      
      const myData = await getLeaves('Employee', user.emp_id);
      setMyLeaves(myData || []);
      
      if (isAdminOrHR) {
        const allData = await getLeaves(user.role);
        setLeaves(allData || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Lifecycle Sync Failure:', err.message);
      toast.error('Sync failed: Backend node unavailable');
      setLoading(false);
    }
  }, [user?.emp_id, user?.role, isAdminOrHR]);

  useEffect(() => {
    fetchData();

    // 📡 Real-Time Protocol Synchronization
    console.log('🔌 Subscribing to Leave Lifecycle Events...');
    socket.on('leaveCreated', () => {
        console.log('🔔 [SOCKET] New leave request detected. Refreshing...');
        fetchData();
        toast('New leave request submitted', { icon: '🔔' });
    });
    socket.on('leaveUpdated', () => {
        console.log('🔔 [SOCKET] Leave status update detected. Refreshing...');
        fetchData();
    });
    socket.on('leaveDeleted', () => {
        console.log('🔔 [SOCKET] Leave record deletion detected. Refreshing...');
        fetchData();
    });

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
        toast.success('Lifecycle Request Persisted');
        setIsModalOpen(false);
        setFormData({ from_date: '', to_date: '', reason: '' });
        fetchData();
      } else {
        toast.error(result.message || 'Request rejected by hub');
      }
    } catch (err) {
       console.error('[Leaves] Submission Error:', err);
       toast.error('Lifecycle handshake failed');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const result = await approveLeave(id, status);
      if (result.success) {
        toast.success(`Leave ${status} Successfully`);
        fetchData();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Status modification failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Strategically decommission this leave record?')) return;
    try {
      const result = await deleteLeave(id);
      if (result.success) {
        toast.success('Record Decommissioned');
        fetchData();
      } else {
        toast.error('Deletion rejected');
      }
    } catch (err) {
      toast.error('Decommissioning protocol failed');
    }
  };

  if (!user) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-gray-300 text-3xl">Synchronizing Identity...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Leave Management</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
             <Calendar size={16} className="text-indigo-500" />
             Strategic Absence Registry • Role: {user.role}
          </p>
        </div>
        
        <div className="flex gap-4 mt-8 md:mt-0 relative z-10">
          <button onClick={fetchData} className="bg-gray-50 text-gray-400 p-5 rounded-3xl border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-inner"><RefreshCw size={28} className={loading ? 'animate-spin' : ''} /></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-200 flex items-center gap-3 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Submit Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {isAdminOrHR && (
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-12 border-b border-gray-50 flex items-center gap-6 bg-indigo-50/20 px-16 relative">
               <div className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200">
                  <ClipboardList size={32} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Admin Approval Hub</h2>
                  <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2">Team Absence Management</p>
               </div>
            </div>
            
            <div className="overflow-x-auto p-12">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Interval</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="4" className="px-8 py-16 text-center font-black text-gray-300 uppercase tracking-[0.4em] animate-pulse">Syncing Hub Registry...</td></tr>
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-200 font-black text-3xl uppercase tracking-widest italic opacity-30">Zero Lifecycle Drift</td></tr>
                  ) : leaves.map((leave, i) => (
                    <tr key={leave.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black shadow-inner"> {leave.employee_name?.charAt(0)} </div>
                          <div>
                            <p className="text-lg font-black text-gray-900 tracking-tight uppercase">{leave.employee_name}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">ID: {leave.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <p className="text-md font-black text-gray-900 tracking-tight">{leave.from_date} → {leave.to_date}</p>
                        <span className="text-[9px] font-black px-3 py-1 bg-white border border-gray-100 rounded-lg text-gray-400 uppercase tracking-widest mt-2 inline-block shadow-sm"> Status: {leave.status} </span>
                      </td>
                      <td className="px-8 py-8">
                        <p className="text-xs font-bold text-gray-500 line-clamp-2 italic leading-relaxed max-w-sm">"{leave.reason}"</p>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 transition-all">
                            {leave.status === 'Pending' ? (
                                <>
                                    <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95"><CheckCircle2 size={24} /></button>
                                    <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl shadow-xl shadow-rose-100 transition-all active:scale-95"><XCircle size={24} /></button>
                                </>
                            ) : (
                                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{leave.status}</span>
                            )}
                            <button onClick={() => handleDelete(leave.id)} className="p-4 bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={24} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-indigo-50/20 px-16 relative">
              <div className="flex items-center gap-6 z-10">
                 <div className="w-16 h-16 bg-white text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl border border-indigo-50">
                    <History size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">My Absence History</h2>
                    <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2">Validated Personal Records</p>
                 </div>
              </div>
           </div>

           <div className="p-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {myLeaves.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-200 font-black text-3xl uppercase tracking-[0.2em] italic opacity-30 select-none">No Absence Records Registered</div>
              ) : myLeaves.map((leave, i) => (
                <div key={leave.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                   <div className={`absolute top-0 right-0 w-2 h-full ${leave.status === 'Approved' ? 'bg-emerald-500' : leave.status === 'Rejected' ? 'bg-rose-500' : 'bg-indigo-500'} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                   
                   <div className="flex justify-between items-start mb-10">
                      <span className="text-[10px] font-black uppercase px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 tracking-widest shadow-inner group-hover:bg-white transition-colors">Absence Request</span>
                      <span className={`text-[11px] font-black uppercase tracking-tighter ${leave.status === 'Approved' ? 'text-emerald-600' : leave.status === 'Rejected' ? 'text-rose-600' : 'text-indigo-600'}`}>{leave.status}</span>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="flex gap-8 justify-between">
                         <div className="flex-1">
                            <p className="text-[10px] uppercase font-black text-gray-300 mb-2 tracking-widest">From</p>
                            <p className="text-xl font-black text-gray-900 tracking-tighter mb-1">{leave.from_date}</p>
                         </div>
                         <div className="flex-1 text-right">
                            <p className="text-[10px] uppercase font-black text-gray-300 mb-2 tracking-widest">To</p>
                            <p className="text-xl font-black text-gray-900 tracking-tighter mb-1">{leave.to_date}</p>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-50 uppercase tracking-tight italic">"{leave.reason}"</p>
                      
                      {leave.status === 'Pending' && (
                        <button onClick={() => handleDelete(leave.id)} className="w-full py-4 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">Cancel Request</button>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-fade-in shadow-2xl">
          <div className="bg-white rounded-[5rem] w-full max-w-xl animate-slide-up border-8 border-white overflow-hidden shadow-2xl">
            <div className="p-16 border-b border-gray-50 bg-[#1e293b] text-white flex justify-between items-center group">
               <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Commit Absence</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-3">Strategic Lifecycle Protocol</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="bg-white/10 text-white p-5 rounded-[1.5rem] transition-all hover:bg-white hover:text-rose-500 hover:rotate-90">
                 <XCircle size={28} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-16 space-y-10">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Start Pulse</label>
                    <input type="date" required className="leave-input" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">End Pulse</label>
                    <input type="date" required className="leave-input" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Reason / Justification</label>
                  <textarea required className="leave-input h-32 resize-none pt-6" placeholder="Document absence reasoning..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                </div>
              </div>
              
              <div className="flex gap-6 pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-8 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Discard</button>
                <button type="submit" className="flex-[2] py-8 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"> Commit Request </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .leave-input { width: 100%; padding: 1.5rem 2rem; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 2.5rem; transition: all 0.2s; font-weight: 900; font-size: 1.125rem; }
        .leave-input:focus { background-color: white; border-color: #4f46e5; outline: none; box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.05); }
      `}</style>
    </div>
  );
};

export default Leaves;

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Plus, Search, Edit2, Trash2, UserPlus, X, RefreshCw, Loader2, DollarSign, Calendar, Lock, AlertTriangle, Users, Filter, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
    joining_date: '',
    salary: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setSyncError(null);
      const response = await api.get('/api/employees');
      
      if (response.data && response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        setEmployees([]);
      }
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      setSyncError(err.message === 'Network Error' ? 'Backend Service Offline' : 'Data Sync Error');
      setLoading(false);
      if (retryCount < 2) {
        setTimeout(() => setRetryCount(prev => prev + 1), 3000);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setFormData({
        emp_id: employee.emp_id,
        name: employee.name,
        email: employee.email,
        password: '',
        role: employee.role,
        department: employee.department,
        joining_date: employee.joining_date,
        salary: employee.salary
      });
      setEditingId(employee.emp_id);
    } else {
      setFormData({
        emp_id: `EMP${Math.floor(Math.random() * 9000) + 1000}`,
        name: '',
        email: '',
        password: 'password123',
        role: 'Employee',
        department: 'Engineering',
        joining_date: new Date().toISOString().split('T')[0],
        salary: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/employees/${editingId}`, formData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/api/employees', formData);
        toast.success('New employee added');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await api.delete(`/api/employees/${id}`);
        toast.success('Employee removed');
        fetchEmployees();
      } catch (err) {
        toast.error('Failed to delete record');
      }
    }
  };

  const filtered = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.emp_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-left">
      {/* Synchronization Error Banner */}
      <AnimatePresence>
        {syncError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
               <AlertTriangle className="text-red-500" size={20} />
               <p className="text-sm font-bold text-red-900">{syncError}. Please check your connection.</p>
            </div>
            <button onClick={() => { setRetryCount(0); fetchEmployees(); }} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage team members, roles, and organizational structure.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchEmployees} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm">
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or email..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <Filter size={18} className="text-slate-400" />
           <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Active Filters: <span className="text-indigo-600 ml-1">None</span></span>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID & Dept</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compensation</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <RefreshCw size={56} className="animate-spin text-indigo-600" />
                      <p className="text-lg font-semibold tracking-tight">Syncing directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Users size={56} />
                      <p className="text-lg font-semibold tracking-tight">No employees found in the directory</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((employee) => (
                <tr key={employee.emp_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
                        {employee.name?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 tracking-tight text-base leading-none">{employee.name}</p>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Mail size={12} className="text-indigo-400" />
                           <p className="text-xs font-medium">{employee.email}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100 font-mono">{employee.emp_id}</span>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{employee.department}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      employee.role === 'Admin' ? 'border-red-200 bg-red-50 text-red-600' :
                      employee.role === 'Manager' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                      'border-emerald-200 bg-emerald-50 text-emerald-600'
                    }`}> {employee.role} </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                       <p className="text font-bold text-slate-900 tracking-tight">${(employee.salary || 0).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 italic"><Calendar size={12} className="text-indigo-400" /> Joined {employee.joining_date}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleOpenModal(employee)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl shadow-sm border border-slate-200 transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(employee.emp_id)} className="p-3 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-slate-200 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Personnel Modal */}
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
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <UserPlus size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[75vh] custom-scrollbar text-left">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required className="form-input-pro" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Alex Johnson" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                  <input type="text" required className="form-input-pro bg-slate-100/50 grayscale opacity-60 cursor-not-allowed font-mono" value={formData.emp_id} readOnly />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" required className="form-input-pro" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="alex@company.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Lock size={12} className="text-indigo-600" /> Account Password</label>
                  <input type="text" required={!editingId} className="form-input-pro" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingId ? 'Leave blank to keep current' : 'Define password'} />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Organizational Role</label>
                  <select className="form-input-pro" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
                  <select className="form-input-pro" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="Executive">Executive</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar size={12} className="text-indigo-600" /> Date of Joining</label>
                  <input type="date" required className="form-input-pro" value={formData.joining_date} onChange={(e) => setFormData({...formData, joining_date: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><DollarSign size={12} className="text-indigo-600" /> Monthly Base Salary ($)</label>
                  <input type="number" required className="form-input-pro font-mono" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
                </div>

                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest text-xs">Save Employee Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .form-input-pro {
           @apply w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 rounded-full; }
      `}</style>
    </div>
  );
};

export default Employees;

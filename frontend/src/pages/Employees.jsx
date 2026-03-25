import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit2, Trash2, UserPlus, X, RefreshCw, Loader2, DollarSign, Calendar, Lock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  /**
   * fetchEmployees - Real-time synchronization with retry mechanism
   */
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setSyncError(null);
      console.log('📡 Syncing Personnel Registry [Attempt:', retryCount + 1, ']');
      
      const response = await axios.get('/api/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
      setRetryCount(0); // Reset on success
    } catch (err) {
      console.error('❌ Cloud Synchronization Failure:', err.message);
      setSyncError(err.message === 'Network Error' ? 'Backend Service Offline' : 'Turso Data Interrupted');
      setLoading(false);
      
      // Auto-retry once after 3 seconds
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
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
        await axios.put(`/api/employees/${editingId}`, formData);
        toast.success('Personnel Record Synchronized');
      } else {
        await axios.post('/api/employees', formData);
        toast.success('New Personnel Persisted on Turso');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Handshake failed with backend registry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will remove the record globally.')) {
      try {
        await axios.delete(`/api/employees/${id}`);
        toast.success('Record Successfully Decommissioned');
        fetchEmployees();
      } catch (err) {
        toast.error('Deletion operation synchronized failure.');
      }
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Synchronization Status Banner */}
      {syncError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between mb-6 shadow-sm">
          <div className="flex items-center gap-3">
             <AlertTriangle className="text-red-500" size={20} />
             <div>
                <p className="text-sm font-black text-red-900 uppercase tracking-widest">Sync Connection Failure</p>
                <p className="text-xs text-red-600 font-bold">{syncError}. Real-time synchronization is currently suspended.</p>
             </div>
          </div>
          <button 
            onClick={() => { setRetryCount(0); fetchEmployees(); }} 
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-200"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Attempt Re-Sync
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Personnel Registry</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Cloud Integrity Level: {syncError ? 'Suspended' : 'Operational'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchEmployees} className={`p-4 rounded-2xl transition-all ${syncError ? 'bg-red-50 text-red-400' : 'bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 shadow-sm border border-gray-100'}`} title="Hard Refetch">
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-[1.25rem] font-black flex items-center gap-2 shadow-xl shadow-primary-100 transition-all active:scale-95 uppercase tracking-widest text-sm">
            <Plus size={18} /> Enroll Personnel
          </button>
        </div>
      </div>

      {/* Search Infrastructure */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4.5 text-gray-400 group-focus-within:text-primary-600" size={20} />
          <input type="text" placeholder="Query name, digital ID, or mail registry..." className="w-full pl-14 pr-6 py-4.5 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-600 transition-all font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Individual Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Strategic Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financial Allocation</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Synchronization Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary-500 mb-6" size={56} />
                    <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Requesting Turso Clusters...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center text-gray-300 font-extrabold text-2xl uppercase italic tracking-widest">{syncError ? 'Registry Unreachable' : 'Clear Personnel Registry'}</td>
                </tr>
              ) : filtered.map((employee) => (
                <tr key={employee.emp_id} className="hover:bg-primary-50/20 transition-all group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">{employee.name.charAt(0)}</div>
                      <div>
                        <p className="font-black text-gray-900 tracking-tight text-lg mb-0.5">{employee.name}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-primary-600 bg-primary-100/50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-primary-200/30 font-mono">{employee.emp_id}</span>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-[0.1em]">{employee.department}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${
                      employee.role === 'Admin' ? 'border-red-100 bg-red-50 text-red-600' :
                      employee.role === 'Manager' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                      'border-green-100 bg-green-50 text-green-600'
                    }`}> {employee.role} </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-1.5">
                       <p className="text-lg font-black text-gray-800 tracking-tighter">${(employee.salary || 0).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} className="text-primary-500" /> Joined {employee.joining_date}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => handleOpenModal(employee)} className="p-4 bg-white text-primary-600 hover:bg-primary-600 hover:text-white rounded-2xl shadow-xl shadow-primary-200/20 border border-primary-100/50 transition-all"><Edit2 size={20} /></button>
                      <button onClick={() => handleDelete(employee.emp_id)} className="p-4 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-2xl shadow-xl shadow-red-200/20 border border-red-100/50 transition-all"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl transform animate-slide-up flex flex-col overflow-hidden max-h-[90vh] shadow-primary-900/10">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary-200"><UserPlus size={32} /></div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Personnel' : 'Enroll Personnel'}</h2>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Infrastructure Synchronization Protocol Active</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-4 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shadow-inner border border-gray-100"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Individual Name</label>
                <input type="text" required className="form-input-modern-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 font-mono">Registry Key (ID)</label>
                <input type="text" required className="form-input-modern-xl bg-gray-50/50 grayscale opacity-70 cursor-not-allowed" value={formData.emp_id} readOnly />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Digital Signature (Email)</label>
                <input type="email" required className="form-input-modern-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 border-primary-100"><Lock size={12} className="text-primary-600" /> Infrastructure Passkey</label>
                <input type="text" required={!editingId} className="form-input-modern-xl" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingId ? '••••••••' : 'Initialize Passkey'} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Strategic Role</label>
                <select className="form-input-modern-xl appearance-none cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Deployment Department</label>
                <select className="form-input-modern-xl appearance-none cursor-pointer" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Executive">Executive</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Calendar size={12} className="text-primary-600" /> Enrollment Date</label>
                <input type="date" required className="form-input-modern-xl" value={formData.joining_date} onChange={(e) => setFormData({...formData, joining_date: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><DollarSign size={12} className="text-primary-600" /> Compensation Package ($)</label>
                <input type="number" required className="form-input-modern-xl font-mono text-lg" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
              </div>

              <div className="md:col-span-2 pt-8 flex gap-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-[0.2em] text-xs">Abandon Entry</button>
                <button type="submit" className="flex-[2] py-5 bg-primary-600 text-white font-black rounded-2xl shadow-2xl shadow-primary-200 hover:bg-primary-700 transition-all uppercase tracking-[0.2em] text-xs">Synchronize Cloud Node</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .form-input-modern-xl {
           @apply w-full px-6 py-4.5 bg-gray-50/50 border border-gray-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-600 transition-all font-bold text-gray-800 placeholder:text-gray-300;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 rounded-full; }
      `}</style>
    </div>
  );
};

export default Employees;

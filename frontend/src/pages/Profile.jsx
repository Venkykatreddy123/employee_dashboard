import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  DollarSign, 
  Shield, 
  Save,
  UserCircle,
  Briefcase,
  Camera,
  Verified,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, fetchMe } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/auth/me', formData);
      toast.success('Identity updated successfully');
      fetchMe();
    } catch (err) {
      toast.error('Identity update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="relative h-64 bg-primary-900 rounded-[3rem] shadow-4xl overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-black/40"></div>
         <div className="absolute top-10 right-10 flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest">
               <Verified size={16} className="text-primary-400" />
               Enterprise Authenticated
            </div>
         </div>
      </div>

      <div className="px-12 -mt-32 relative z-10 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left">
           <div className="relative group">
              <div className="w-56 h-56 bg-white rounded-[3.5rem] border-[1rem] border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                 <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-6xl shadow-inner uppercase tracking-tighter italic italic italic">
                    {user?.name?.charAt(0)}
                 </div>
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={48} className="text-white drop-shadow-lg" />
                 </div>
              </div>
           </div>
           
           <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">{user?.name}</h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                 <span className="px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-200">{user?.role}</span>
                 <span className="px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-400">{user?.emp_id}</span>
              </div>
           </div>

           <div className="w-full h-px bg-gray-100/50"></div>

           <div className="w-full space-y-6">
              <div className="flex justify-between items-center p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-50/50 group/item hover:shadow-xl transition-all cursor-default">
                 <div className="flex items-center gap-4">
                    <Calendar size={20} className="text-primary-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Joined On</span>
                 </div>
                 <span className="text-sm font-black text-gray-900 group-hover/item:text-primary-600 transition-colors uppercase tracking-tight">{user?.joining_date}</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-50/50 group/item hover:shadow-xl transition-all cursor-default">
                 <div className="flex items-center gap-4">
                    <Briefcase size={20} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Fiscal Band</span>
                 </div>
                 <span className="text-sm font-black text-gray-900 group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">${Number(user?.salary).toLocaleString()}</span>
              </div>
           </div>

           <div className="w-full p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 text-amber-700 space-y-4 shadow-sm shadow-amber-50">
              <div className="flex gap-4 items-center">
                 <ShieldAlert size={28} className="text-amber-500 animate-pulse" />
                 <h3 className="text-lg font-black uppercase tracking-tight italic italic italic leading-none translate-y-0.5">Security Audit</h3>
              </div>
              <p className="text-xs font-semibold leading-relaxed tracking-widest uppercase opacity-80">Your profile is strictly audited under corporate compliance. Some attributes are restricted to administrative modification.</p>
           </div>
        </div>

        <div className="lg:w-2/3">
           <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden group">
              <div className="p-12 border-b border-gray-50 bg-gray-50/30 px-16">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#0f172a] text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200 group-hover:scale-110 transition-transform">
                       <User size={32} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic italic italic">Identity Management</h2>
                       <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-1.5">Manage Your Professional Digital Asset</p>
                    </div>
                 </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-16 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Full Identity (Name)</label>
                       <div className="relative group/field">
                          <UserCircle size={24} className="absolute left-6 top-6 text-gray-300 group-focus-within/field:text-primary-500 transition-colors" />
                          <input
                            type="text"
                            required
                            placeholder="John Carter Doe"
                            className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-600 transition-all font-black text-xl text-gray-900 placeholder:text-gray-300 shadow-inner"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Digital Core (Email)</label>
                       <div className="relative group/field">
                          <Mail size={24} className="absolute left-6 top-6 text-gray-300 group-focus-within/field:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="j.doe@empdash.ai"
                            className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-black text-xl text-gray-900 placeholder:text-gray-300 shadow-inner"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-4 pt-4">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Access Key (New Password)</label>
                       <div className="relative group/field">
                          <Lock size={24} className="absolute left-6 top-6 text-gray-300 group-focus-within/field:text-red-500 transition-colors" />
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all font-black text-xl text-gray-900 placeholder:text-gray-300 shadow-inner"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <p className="absolute right-8 top-7 text-[10px] font-black text-gray-300 uppercase tracking-widest hidden group-focus-within/field:block">Security Locked</p>
                       </div>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-8 mt-4 italic italic italic">Leave blank to maintain current cryptographic key protocols</p>
                    </div>
                 </div>

                 <div className="pt-10">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-8 bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-sm rounded-[3rem] shadow-3xl shadow-primary-200/50 hover:bg-primary-700 hover:shadow-primary-300/50 active:scale-[0.98] transition-all flex items-center justify-center gap-5 group"
                    >
                       {loading ? 'Executing Update...' : (
                         <>
                            <Save size={24} className="group-hover:-translate-y-1 transition-transform" />
                            Finalize Identity Updates
                         </>
                       )}
                    </button>
                    <div className="mt-12 flex items-center gap-4 justify-center">
                       <Shield size={16} className="text-gray-300" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic italic italic">Secure SSL Authenticated Endpoint Encryption</p>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

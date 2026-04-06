import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Video } from 'lucide-react';

const JoinRedirect = () => {
  const { meeting_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing strategic handshake...');

  useEffect(() => {
    let isMounted = true;

    const performJoin = async () => {
      // Small delay to ensure AuthContext is fully hydrated
      await new Promise(r => setTimeout(r, 500));
      
      if (!isMounted) return;

      if (!user) {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('🔑 [Join Protocol] Identity missing. Redirecting to Login node.');
          setStatus('Identity required for session access...');
          navigate('/login', { state: { from: `/meet/${meeting_id}` } });
          return;
        }
        // If token exists but user isn't in context yet, it might still be loading
        return; 
      }

      try {
        setStatus('Synchronizing terminal credentials...');
        const response = await api.post(`/api/meetings/join-by-link/${meeting_id}`, {
          employee_id: user.emp_id
        });

        if (response.data.success && isMounted) {
          toast.success('Strategy Handshaked: Access Granted');
          navigate(`/meetings/${meeting_id}`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('🛑 [Join Protocol Failure]', err);
        toast.error(err.response?.data?.message || 'Strategic link decommissioning detected');
        navigate('/meetings');
      }
    };

    if (meeting_id) {
      performJoin();
    }

    return () => { isMounted = false; };
  }, [meeting_id, user, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="relative">
        <Video size={80} className="text-indigo-500 animate-pulse mb-8" />
        <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl animate-pulse -z-10 rounded-full" />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-[0.5em] italic text-center px-6">
        {status}
      </h2>
      <div className="mt-8 flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
};

export default JoinRedirect;

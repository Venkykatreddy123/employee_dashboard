import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../styles/login.css'; // Correct CSS path
import { ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Security Failure: Invalid Personnel Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-circle">
          <ShieldAlert size={42} strokeWidth={2.5} />
        </div>
        
        <h2 className="login-title">EMP Protocol Access</h2>
        <p className="text-secondary small mb-4">Enter credentials to initialize secure session.</p>

        <form onSubmit={handleLogin} className="mt-4 text-start">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-3 py-3 mb-4">
              <span className="fw-black text-[10px] tracking-widest opacity-70">ERR:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 d-block ms-1">
              System Identifier (Email)
            </label>
            <input 
              type="email" 
              className="form-control form-control-custom"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required 
            />
          </div>

          <div className="mb-5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 d-block ms-1">
              Access Key
            </label>
            <input 
              type="password" 
              className="form-control form-control-custom"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-3 text-uppercase tracking-widest fw-black"
            style={{ borderRadius: '16px', letterSpacing: '0.1em' }}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" size={24} />
            ) : (
              'Initialize Protocol'
            )}
          </button>
        </form>
        
        <div className="mt-5 pt-4 border-top border-white opacity-10"></div>
        <p className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          End-to-End Encrypted Session
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

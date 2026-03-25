import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/login.css';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log(`[Login Process] Attempting protocol access for: ${email}`);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response;
      
      console.log('[Login Process] Server Response Received. Validating token...');
      
      if (!data.token) {
        console.error('[Login Process] ❌ Security Flaw: Server returned success but NO TOKEN.');
        throw new Error('Server protocol breach: No session token returned.');
      }

      // Store core auth data
      console.log('[Login Process] ✅ Token validated. Storing session artifacts...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log(`[Login Process] Session verified for: ${data.user.name} (${data.user.role})`);
      
      const role = data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else navigate('/employee');
    } catch (err) {
      console.error('[Login Process] ❌ Protocol initialization failure:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      setError(status === 401 ? 'Security Failure: Invalid Personnel Credentials' : `Sync Error [${status}]: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-circle">
          <ShieldAlert size={36} />
        </div>
        <h3 className="login-title">EMP Protocol Access</h3>
        <p className="text-secondary small mb-4">Enter credentials to initialize secure session.</p>
        
        {error && (
          <div className="alert alert-danger py-2 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span className="fw-bold">ERR:</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="text-start mb-1 ms-1 small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>System Identifier (Email)</div>
          <input
            type="email"
            className="form-control form-control-custom"
            placeholder="email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="text-start mb-1 mt-3 ms-1 small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>Access Key</div>
          <input
            type="password"
            className="form-control form-control-custom"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mt-4 shadow-lg fw-bold"
            disabled={loading}
          >
            {loading ? 'CALCULATING HANDSHAKE...' : 'INITIALIZE PROTOCOL'}
          </button>
        </form>
        
        <div className="mt-4 pt-3 border-top border-light text-secondary small">
          <div className="fw-bold mb-1">Standard Node Debug Keys:</div>
          <div className="d-flex justify-content-between">
            <span>Admin: <code>admin</code></span>
            <span>Pass: <code>password123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

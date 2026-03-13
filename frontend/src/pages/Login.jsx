import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('name', response.data.user.name || response.data.user.username);
            localStorage.setItem('employee_id', response.data.user.id || '');
            
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            position: 'fixed'
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '3.5rem',
                margin: '1rem',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ffffff'
            }}>
                <div className="login-logo text-center mb-5">
                    <h1 style={{fontSize: '3rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.06em'}}>NEXUS HR</h1>
                    <div style={{height: '4px', width: '40px', background: 'var(--primary)', margin: '1rem auto', borderRadius: '2px'}}></div>
                    <p className="text-muted mt-3" style={{letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: '700'}}>VERSION 4.0 // LIGHT PROTOCOL</p>
                </div>
                
                {error && <div className="alert alert-danger border-0 small text-center mb-4" style={{borderRadius: '12px', background: '#fef2f2', color: '#ef4444'}}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold text-uppercase mb-2">Access Identity</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', padding: '1rem', borderRadius: '12px'}}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your handle"
                        />
                    </div>
                    
                    <div className="mb-5">
                        <label className="form-label text-muted small fw-bold text-uppercase mb-2">Security Hash</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', padding: '1rem', borderRadius: '12px'}}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-100 py-3 mb-4" disabled={loading} style={{fontSize: '1rem', fontWeight: '700', borderRadius: '12px'}}>
                        {loading ? 'Authenticating...' : 'Establish Connection'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <span style={{color: '#94a3b8', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.05em'}}>SECURE SHA-256 ENCRYPTION</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

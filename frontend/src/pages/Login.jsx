import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ChevronRight, Activity, Globe } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-split">
            {/* Left Section: Form */}
            <div className="login-left animate-fade">
                <div className="login-card-refined">
                    <div className="login-logo-container">
                        <div className="login-logo-icon">
                            <Activity size={24} />
                        </div>
                        <h1 className="login-title-text mb-0">CloudOps</h1>
                    </div>
                    
                    <p className="login-subtitle-text">Workforce Productivity Suite</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group mb-0">
                            <label className="form-label flex items-center gap-2 mb-2 font-semibold text-slate-700">
                                <Mail size={14} className="text-slate-400" />
                                Email Address
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="form-input py-3"
                                placeholder="name@company.com"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group mb-0">
                            <div className="flex justify-between items-center mb-2">
                                <label className="form-label flex items-center gap-2 mb-0 font-semibold text-slate-700">
                                    <Lock size={14} className="text-slate-400" />
                                    Password
                                </label>
                                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="form-input py-3"
                                placeholder="••••••••"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-center gap-2 mb-6 animate-shake">
                                <ShieldCheck size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 group transition-all"
                            style={{ height: 'auto', padding: '12px 1.25rem' }}
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Sign In
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer-text">
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                            <ShieldCheck size={14} />
                            Secured Internal Environment
                        </div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest">
                            Authorized Access Only © CloudOps Infrastructure
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section: Decorative Gradient */}
            <div className="login-right animate-fade">
                <div className="text-center p-12 relative z-10 max-w-lg">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                        <Globe size={40} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">The Modern Work OS</h2>
                    <p className="text-white/80 text-lg font-medium leading-relaxed">
                        Empower your global workforce with real-time telemetry and advanced productivity insights.
                    </p>
                    
                    <div className="mt-12 flex justify-center gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-12 h-1 bg-white/20 rounded-full">
                                <div className={`h-full bg-white rounded-full ${i === 1 ? 'w-full' : 'w-0'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Login;

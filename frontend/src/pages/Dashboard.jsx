import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Charts from '../components/Charts';
import '../styles/login.css'; // Adding for completeness in bundle

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        employeesPresentToday: 0,
        employeesOnLeave: 0,
        totalBonuses: 0,
        totalWorkingHoursToday: 0,
        avgProductivityScore: 0
    });
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchStats = async () => {
            if (role === 'admin' || role === 'manager') {
                try {
                    const response = await api.get('/dashboard/stats');
                    setStats(response.data);
                } catch (error) {
                    console.error('Failed to fetch stats', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); 
            }
        };

        fetchStats();
    }, [role]);

    if (loading) return <div>Loading dashboard...</div>;

    const name = localStorage.getItem('name');

    return (
        <div className="fade-in">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '800', color: '#0f172a'}}>Operational Dashboard</h2>
                    <p className="text-muted small mt-1">Real-time telemetry and resource utilization metrics.</p>
                </div>
                {role === 'admin' && <span className="badge badge-info shadow-sm">ADMINISTRATIVE OVERVIEW</span>}
            </div>

            {(role === 'admin' || role === 'manager') && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Total Workforce</div>
                        <div className="stat-value" style={{color: 'var(--primary)'}}>{stats.totalEmployees || 0}</div>
                        <div className="text-muted small mt-2 fw-medium">{role === 'manager' ? 'In your assigned unit' : 'Active personnel accounts'}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Operations Active</div>
                        <div className="stat-value" style={{color: 'var(--secondary)'}}>{stats.employeesPresentToday || 0}</div>
                        <div className="text-muted small mt-2 fw-medium">Currently checked in</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Personnel Efficiency</div>
                        <div className="stat-value" style={{color: '#8b5cf6'}}>{stats.avgProductivityScore?.toFixed(1) || 0}%</div>
                        <div className="text-muted small mt-2 fw-medium">Aggregate metric</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Resource Velocity</div>
                        <div className="stat-value" style={{color: '#10b981'}}>{stats.totalWorkingHoursToday?.toFixed(1) || 0}h</div>
                        <div className="text-muted small mt-2 fw-medium">Cycle delta</div>
                    </div>
                </div>
            )}

            <div className="glass-card p-5 mt-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h3 className="mb-3" style={{fontWeight: '700'}}>Welcome back, {name || 'User'}</h3>
                        <p className="text-muted mb-0" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                           {role === 'admin' 
                             ? "Platform oversight is active. You have full administrative control over all organizational parameters."
                             : role === 'manager'
                             ? "Unit management is operational. Monitor your team's telemetry and optimize resource allocation."
                             : "Your daily telemetry is being recorded. Continue maintaining optimal productivity across your assigned work cycles."
                           }
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <Charts />
            </div>
        </div>
    );
};

export default Dashboard;

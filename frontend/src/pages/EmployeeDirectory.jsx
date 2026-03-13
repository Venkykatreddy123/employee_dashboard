import React, { useState, useEffect } from 'react';
import api from '../api/api';

const EmployeeDirectory = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                const response = await api.get('/employees/directory');
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching directory', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDirectory();
    }, []);

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) || 
        (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="fade-in text-light">
            <div className="page-title d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 style={{fontWeight: '700'}}>Team Directory</h2>
                    <p className="text-muted small">Explore the personnel hierarchy and department structures.</p>
                </div>
                <div style={{width: '320px'}}>
                     <input 
                        type="text"                         className="form-control bg-light border-light" 
                        style={{borderRadius: '12px', padding: '0.75rem 1.25rem'}}
                        placeholder="Search identities or units..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="row g-4 mt-2">
                {filteredEmployees.map(emp => (
                    <div className="col-md-4 col-xl-3" key={emp.id}>
                        <div className="glass-card text-center p-4 h-100 d-flex flex-column align-items-center justify-content-center" style={{transition: 'transform 0.3s ease'}}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" 
                                 style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'}}>
                                <span className="fs-2 text-white fw-bold text-uppercase" style={{letterSpacing: '-0.05em'}}>{emp.name.charAt(0)}</span>
                            </div>
                            <h5 className="mb-1" style={{fontWeight: '700'}}>{emp.name}</h5>
                            <p className="text-muted small mb-3 fw-bold text-uppercase" style={{letterSpacing: '0.05em'}}>{emp.department || 'General Operations'}</p>
                            <span className={`badge ${emp.role === 'admin' ? 'badge-warning' : emp.role === 'manager' ? 'badge-info' : 'badge-primary'}`}>
                                {emp.role === 'admin' ? 'System Admin' : emp.role === 'manager' ? 'Unit Manager' : 'Specialist'}
                            </span>
                        </div>
                    </div>
                ))}
                
                {filteredEmployees.length === 0 && (
                    <div className="col-12 text-center p-5 glass-card">
                        <div className="text-muted fs-5">No personnel found matching the specified telemetry.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDirectory;

import React from 'react';

const EmployeeTable = ({ employees, onDelete }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Identity</th>
                        <th>Communication</th>
                        <th>Classification</th>
                        <th>Org Unit</th>
                        <th>Performance Index</th>
                        <th>Comp. Rate</th>
                        <th>Start Signature</th>
                        <th className="text-end">Command</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td className="fw-bold" style={{color: 'var(--primary)'}}>{emp.name}</td>
                            <td className="text-muted small">{emp.email}</td>
                            <td><span className={`badge ${emp.role === 'admin' ? 'badge-warning' : emp.role === 'manager' ? 'badge-info' : 'badge-success'}`}>{emp.role}</span></td>
                            <td>{emp.department || '—'}</td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="progress flex-grow-1" style={{height: '6px', minWidth: '80px'}}>
                                        <div className="progress-bar bg-info" style={{width: `${emp.productivity_score || 0}%`, boxShadow: '0 0 10px var(--secondary)'}}></div>
                                    </div>
                                    <span className="small fw-bold">{emp.productivity_score?.toFixed(0) || 0}%</span>
                                </div>
                            </td>
                            <td className="fw-medium">{emp.salary ? `$${emp.salary.toLocaleString()}` : '—'}</td>
                            <td className="text-muted">{emp.joining_date}</td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-outline-danger" style={{borderRadius: '8px'}} onClick={() => onDelete(emp.id)}>Terminate Access</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {employees.length === 0 && <div className="text-center p-5 text-muted">No personnel telemetry found.</div>}
        </div>
    );
};

export default EmployeeTable;

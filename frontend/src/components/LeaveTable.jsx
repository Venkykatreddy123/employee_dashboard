import React from 'react';

const LeaveTable = ({ leaves, isAdmin, onStatusUpdate }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        {isAdmin && <th>Personnel Identity</th>}
                        <th>Leave Classification</th>
                        <th>Temporal Range</th>
                        <th>Context/Reason</th>
                        <th>Resolution Status</th>
                        {isAdmin && <th className="text-end">Command Center</th>}
                    </tr>
                </thead>
                <tbody>
                    {leaves.map(leave => (
                        <tr key={leave.id}>
                            {isAdmin && <td className="fw-bold" style={{color: 'var(--primary)'}}>{leave.name}</td>}
                            <td><span className="badge badge-info">{leave.leave_type}</span></td>
                            <td className="small text-muted">{leave.start_date} → {leave.end_date}</td>
                            <td className="small">{leave.reason}</td>
                            <td>
                                <span className={`badge ${
                                    leave.status === 'Approved' ? 'badge-success' : 
                                    leave.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                                }`}>
                                    {leave.status === 'Pending' ? 'In Review' : leave.status}
                                </span>
                            </td>
                            {isAdmin && (
                                <td className="text-end">
                                    {leave.status === 'Pending' && (
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button className="btn btn-sm btn-primary" style={{borderRadius: '8px'}} onClick={() => onStatusUpdate(leave.id, 'Approved')}>Authorize</button>
                                            <button className="btn btn-sm btn-outline-danger" style={{borderRadius: '8px'}} onClick={() => onStatusUpdate(leave.id, 'Rejected')}>Decline</button>
                                        </div>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {leaves.length === 0 && <div className="text-center p-5 text-muted">No leave telemetry requests found.</div>}
        </div>
    );
};

export default LeaveTable;

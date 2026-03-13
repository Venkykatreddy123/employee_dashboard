import React from 'react';

const AttendanceTable = ({ records, isAdmin }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        {isAdmin && <th>Employee Context</th>}
                        <th>Log Date</th>
                        <th>Checkpoint Alpha</th>
                        <th>Checkpoint Omega</th>
                        <th>Net Duration</th>
                        <th>System Status</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(record => (
                        <tr key={record.id}>
                            {isAdmin && <td className="fw-bold" style={{color: 'var(--primary)'}}>{record.name}</td>}
                            <td>{record.date}</td>
                            <td>{new Date(record.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td>{record.check_out ? new Date(record.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</td>
                            <td>{record.work_hours ? <span className="badge badge-info">{record.work_hours.toFixed(2)}h</span> : '—'}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    {record.is_manual_override === 1 && <span className="badge badge-warning">Manual Override</span>}
                                    {record.check_out 
                                        ? <span className="badge badge-success">Cycle Complete</span>
                                        : <span className="badge badge-primary">Active Session</span>
                                    }
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {records.length === 0 && <div className="text-center p-5 text-muted">No attendance telemetry detected.</div>}
        </div>
    );
};

export default AttendanceTable;

import React from 'react';

const BonusTable = ({ bonuses, isAdmin }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        {isAdmin && <th>Recipient Identity</th>}
                        <th>Allocated Amount</th>
                        <th>Issuance Rationale</th>
                        <th>Cycle Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bonuses.map(bonus => (
                        <tr key={bonus.id}>
                            {isAdmin && <td className="fw-bold" style={{color: 'var(--primary)'}}>{bonus.name}</td>}
                            <td className="fw-bold" style={{color: 'var(--secondary)', fontSize: '1.1rem'}}>
                                ${Number(bonus.bonus_amount).toLocaleString()}
                            </td>
                            <td className="small">{bonus.bonus_reason}</td>
                            <td className="text-muted small">{bonus.date_given}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {bonuses.length === 0 && <div className="text-center p-5 text-muted">No incentive telemetry recorded.</div>}
        </div>
    );
};

export default BonusTable;

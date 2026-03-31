import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

const PayslipManagement = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchPayslips = async () => {
            try {
                const { data } = await api.get('/payslip');
                setPayslips(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchPayslips();
    }, []);

    const handleGenerateAll = async () => {
        try {
            setLoading(true);
            await api.post('/payslip/generate-all');
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = (ps) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Official Payslip Document", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Personnel Name: ${ps.employee}`, 14, 32);
        doc.text(`Salary Period: ${ps.month}`, 14, 40);
        
        autoTable(doc, {
            startY: 50,
            head: [['Description', 'Amount (USD)']],
            body: [
                ['Base Salary', `$${ps.base_salary}`],
                ['Bonus Pay', `$${ps.bonus}`],
                ['Deductions', `-$${ps.deductions}`],
                ['Total Net Salary', `$${ps.net_salary}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [78, 115, 223] },
            bodyStyles: { minCellHeight: 12 },
        });

        const yAfterTable = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.text("Generated securely by Unified Management Protocol.", 14, yAfterTable);
        doc.save(`${ps.employee}_Payslip_${ps.month}.pdf`);
    };

    return (
        <div className="px-4 py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Official Payroll Transcripts</h4>
                {user.role === 'admin' && (
                    <button className="btn btn-primary fw-bold px-4" onClick={handleGenerateAll} disabled={loading}>
                        Generate All Staff Payslips
                    </button>
                )}
            </div>
            <div className="table-custom shadow-sm border-0">
                <table className="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cycle</th>
                            <th>Identity Node</th>
                            <th>Final Net Salary</th>
                            <th>Generation Timestamp</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4">Syncing Payslips...</td></tr>
                        ) : payslips.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No active payslip nodes generated for your profile.</td></tr>
                        ) : payslips.map(ps => (
                            <tr key={ps.id}>
                                <td>PAY-00{ps.id}</td>
                                <td className="fw-bold">{ps.month}</td>
                                <td>{ps.employee}</td>
                                <td className="text-success fw-bold">${ps.net_salary}</td>
                                <td>{new Date(ps.generated_at).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        className="btn btn-sm btn-outline-primary fw-bold" 
                                        onClick={() => handleDownload(ps)}
                                    >
                                        Download PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayslipManagement;

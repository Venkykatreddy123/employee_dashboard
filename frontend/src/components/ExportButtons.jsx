import React from 'react';
import axios from 'axios';

const ExportButtons = ({ type }) => {
    const handleExport = async (format) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/reports/${format}/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Error exporting ${format}:`, err);
            alert(`Failed to export ${format.toUpperCase()}`);
        }
    };

    return (
        <div className="flex gap-3">
            <button 
                onClick={() => handleExport('csv')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
                Export CSV
            </button>
            <button 
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-900 transition-all"
            >
                Export PDF
            </button>
        </div>
    );
};

export default ExportButtons;

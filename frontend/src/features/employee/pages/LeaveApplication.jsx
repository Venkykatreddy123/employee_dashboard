import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLeaves, addLeave } from '@/services/leavesService';
import { Calendar, Send, History, CheckCircle, Clock } from 'lucide-react';

const LeaveApplication = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ 
    from_date: '', 
    to_date: '', 
    reason: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    if (!user?.emp_id) return;
    const data = await getLeaves(user.role, user.emp_id);
    setLeaves(data);
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      employee_id: user.emp_id,
      from_date: formData.from_date,
      to_date: formData.to_date,
      reason: formData.reason
    };

    const result = await addLeave(payload);
    if (result.success) {
      setFormData({ from_date: '', to_date: '', reason: '' });
      fetchLeaves();
      alert('Leave application submitted successfully!');
    } else {
      alert(result.message || 'Failed to submit leave');
    }
    setSubmitting(false);
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Leave Management</h2>
        <p style={{ color: '#64748b' }}>Apply for time off and track your request status</p>
      </header>

      <div className="grid grid-cols-3">
        {/* Application Form */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Request</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>From Date</label>
              <input 
                type="date" 
                value={formData.from_date}
                onChange={(e) => setFormData({...formData, from_date: e.target.value})}
                required
                className="input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>To Date</label>
              <input 
                type="date" 
                value={formData.to_date}
                onChange={(e) => setFormData({...formData, to_date: e.target.value})}
                required
                className="input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reason</label>
              <textarea 
                rows="4" 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                className="input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                placeholder="Brief reason for leave..."
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} /> My Leave History
          </h3>
          <div style={{ borderTop: '1px solid #f1f5f9' }}>
            {leaves.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No leave applications found.</p>
            ) : (
              leaves.map(leave => (
                <div key={leave.id} style={{ padding: '1.25rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>{leave.reason}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {leave.from_date} to {leave.to_date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${leave.status === 'Approved' ? 'badge-success' : leave.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                      {leave.status === 'Approved' ? <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : 
                       leave.status === 'Pending' ? <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : ''}
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;

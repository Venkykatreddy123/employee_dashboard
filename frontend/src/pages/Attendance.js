import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AttendanceTable from '../components/AttendanceTable';
import { LogIn, LogOut, CheckCircle, Play, Square } from 'lucide-react';
import { format } from 'date-fns';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const attUrl = (user.role === 'admin' || user.role === 'manager') 
        ? `/attendance?role=${user.role}` 
        : `/attendance?role=${user.role}&user_id=${user.id}`;
      const [attRes, userRes] = await Promise.all([
        api.get(attUrl),
        user.role !== 'employee' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setAttendance(attRes.data);
      if (user.role !== 'employee') setEmployees(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    } else {
      console.warn('[Attendance] No token found, skipping fetch.');
    }
  }, []);

  const handleAction = async (type) => {
    const targetId = user.role === 'employee' ? user.id : selectedEmp;
    if (!targetId) return alert('Please select a user!');
    
    try {
      const endpoint = type === 'checkin' ? '/attendance/check-in' : '/attendance/check-out';
      await api.post(endpoint, { user_id: targetId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'employee' ? 'My Work Sessions' : 'Workforce Presence Tracker'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'employee' ? 'Log your daily work and monitor session progress.' : 'Monitor team activity and session progress.'}
          </p>
        </div>

        <div className="d-flex gap-2">
          {user.role !== 'employee' && (
            <select className="form-select" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
               <option value="">Select User</option>
               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button className="btn btn-success d-flex align-items-center gap-2 shadow-sm" onClick={() => handleAction('checkin')}>
            <Play size={18} /> {user.role === 'employee' ? 'Start Session' : 'Check-in'}
          </button>
          <button className="btn btn-warning d-flex align-items-center gap-2 shadow-sm" onClick={() => handleAction('checkout')}>
            <Square size={18} /> {user.role === 'employee' ? 'End Session' : 'Check-out'}
          </button>
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {user.role !== 'employee' && <th>User Identity</th>}
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((att) => (
              <tr key={att.id} className="align-middle">
                {user.role !== 'employee' && <td>{att.user_name}</td>}
                <td>{att.check_in ? format(new Date(att.check_in), 'h:mm a MMM d') : '-'}</td>
                <td>{att.check_out ? format(new Date(att.check_out), 'h:mm a MMM d') : '-'}</td>
                <td>
                  <span className={`badge rounded-pill ${att.check_out ? 'bg-success' : 'bg-primary'}`}>
                    {att.check_out ? 'Concluded' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

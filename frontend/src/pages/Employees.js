import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [currentEmp, setCurrentEmp] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'employee'
  });

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('[Employees] Fetching user records...');
      const url = user.role === 'admin' ? '/users' : `/users?role=manager&id=${user.id}`;
      const { data } = await api.get(url);
      setEmployees(data);
    } catch (err) {
      console.error('[Employees] Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      console.log(`[Employees] ${editMode ? 'Updating' : 'Creating'} user:`, currentEmp.email);
      if (editMode) {
        await api.put(`/users/${currentEmp.id}`, currentEmp);
      } else {
        await api.post('/users', currentEmp);
      }
      setShowModal(false);
      fetchEmployees();
      resetForm();
    } catch (err) {
      console.error('[Employees] Submit Error:', err);
      setFormError(err.response?.data?.message || 'Protocol Failure: Unable to synchronize record.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentEmp({ 
      name: '', 
      email: '', 
      password: '',
      role: 'employee'
    });
  };

  const handleEdit = (userObj) => {
    setEditMode(true);
    setCurrentEmp({ ...userObj, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user record?')) {
      try {
        console.log(`[Employees] Deleting user ID: ${id}`);
        await api.delete(`/users/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error('[Employees] Delete Error:', err);
        alert('Error deleting user');
      }
    }
  };

  const viewProtocolDetails = (id) => {
    navigate(`/employee/${id}`);
  };

  const filteredEmployees = employees.filter(emp => 
    filterRole === 'All' ? true : emp.role === filterRole
  );

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'admin' ? 'Enterprise User Management' : 'Team Directory'}
          </h4>
          <p className="text-secondary small mb-0">Total of {employees.length} records active.</p>
        </div>
        <div className="d-flex gap-3">
          <select 
            className="form-select" 
            style={{ width: '160px' }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="employee">Employees</option>
            <option value="manager">Managers</option>
            <option value="admin">Admins</option>
          </select>
          {user.role === 'admin' && (
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow" onClick={() => { setEditMode(false); resetForm(); setShowModal(true); }}>
              <Plus size={18} /> New Protocol
            </button>
          )}
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Protocol Identity</th>
              <th>System Role</th>
              <th>Assignment</th>
              <th>Encryption Profile</th>
              <th>Security Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="align-middle">
                <td>
                  <div className="fw-bold mb-0">{emp.name}</div>
                  <div className="small text-secondary">{emp.email}</div>
                </td>
                <td>
                  <span className={`badge ${emp.role === 'admin' ? 'bg-danger' : emp.role === 'manager' ? 'bg-primary' : 'bg-secondary'}`}>
                    {emp.role.toUpperCase()}
                  </span>
                </td>
                <td>{emp.department || 'General Operations'}</td>
                <td>{emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-primary px-3 shadow-sm"
                      onClick={() => viewProtocolDetails(emp.id)}
                    >
                      LOGS
                    </button>
                    {user.role === 'admin' && (
                      <>
                        <button onClick={() => handleEdit(emp)} className="btn btn-sm btn-outline-secondary">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editMode ? 'Edit Protocol' : 'Create New Protocol'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger small py-2 mb-3">
                      <span className="fw-bold">SYNC ERROR:</span> {formError}
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary">Full Identity Name</label>
                      <input type="text" className="form-control" value={currentEmp.name} onChange={e => setCurrentEmp({...currentEmp, name: e.target.value})} required />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary">Access Email</label>
                      <input type="email" className="form-control" value={currentEmp.email} onChange={e => setCurrentEmp({...currentEmp, email: e.target.value})} required />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary">{editMode ? 'Reset Passkey (Optional)' : 'Standard Passkey'}</label>
                      <input type="password" placeholder="••••••••" className="form-control" value={currentEmp.password} onChange={e => setCurrentEmp({...currentEmp, password: e.target.value})} required={!editMode} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary">Operational Role</label>
                      <select className="form-select" value={currentEmp.role} onChange={e => setCurrentEmp({...currentEmp, role: e.target.value})} required>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)} disabled={loading}>Abort</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold shadow" disabled={loading}>
                    {loading ? 'SYNCHRONIZING...' : 'Synchronize'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

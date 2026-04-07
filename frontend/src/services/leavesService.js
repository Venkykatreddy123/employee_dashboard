import { API_BASE, tryFetch } from './apiClient';

// ── Mock fallback ──────────────────────────────────────────────
const defaultLeaves = [
  { id: 1, userId: 3, name: 'Employee User', type: 'Sick Leave',   date: '2026-03-20', status: 'Pending',  reason: 'Fever' },
  { id: 2, userId: 3, name: 'Employee User', type: 'Annual Leave', date: '2026-04-15', status: 'Approved', reason: 'Vacation' },
];

const getStored = () => { try { return JSON.parse(localStorage.getItem('emp_leaves')) || defaultLeaves; } catch { return defaultLeaves; } };
const save = (l) => localStorage.setItem('emp_leaves', JSON.stringify(l));
let mock = getStored();

// ── API Functions ──────────────────────────────────────────────
export const getLeaves = async (role, userId) => {
  // Use specialized endpoints for roles
  const path = (role === 'Employee' && userId) ? `${API_BASE}/leaves/my/${userId}` : `${API_BASE}/leaves`;
  
  const data = await tryFetch(path);
  if (data?.success) {
    return data.data;
  }
  return role === 'Employee' && userId ? mock.filter(l => l.userId === userId) : mock;
};

export const addLeave = async (leave) => {
  console.log('[API] Applying for leave via Backend');
  // leave should have employee_id, from_date, to_date, reason
  const data = await tryFetch(`${API_BASE}/leaves`, { 
    method: 'POST', 
    body: JSON.stringify(leave) 
  });
  return data;
};

export const approveLeave = async (id, status) => {
  console.log(`[API] Processing leave ${id} for ${status}`);
  const data = await tryFetch(`${API_BASE}/leaves/${id}`, { 
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return data;
};

export const deleteLeave = async (id) => {
  console.log(`[API] Deleting leave ${id}`);
  const data = await tryFetch(`${API_BASE}/leaves/${id}`, { method: 'DELETE' });
  return data;
};

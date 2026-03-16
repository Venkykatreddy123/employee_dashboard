const mockData = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'hashed_admin123', role_id: 3, role_name: 'Admin', department: 'Executive', salary: 120000, joining_date: '2023-01-01', productivity_score: 95 },
        { id: 2, name: 'Manager John', email: 'manager@example.com', password: 'hashed_manager123', role_id: 2, role_name: 'Manager', department: 'Engineering', salary: 90000, joining_date: '2023-02-15', productivity_score: 88, manager_id: 1 },
        { id: 3, name: 'Employee Alice', email: 'employee@example.com', password: 'hashed_employee123', role_id: 1, role_name: 'Employee', department: 'Engineering', salary: 70000, joining_date: '2023-03-10', productivity_score: 82, manager_id: 2 },
    ],
    roles: [
        { id: 1, name: 'Employee' },
        { id: 2, name: 'Manager' },
        { id: 3, name: 'Admin' }
    ],
    work_sessions: [
        { id: 1, user_id: 3, login_time: new Date(Date.now() - 3600000).toISOString(), logout_time: null, idle_time: 5, manual_adjustment: false, name: 'Employee Alice' }
    ],
    break_sessions: [
        { id: 1, user_id: 3, break_type: 'Coffee', start_time: new Date(Date.now() - 1800000).toISOString(), end_time: new Date(Date.now() - 1200000).toISOString(), duration: 10 }
    ],
    meetings: [
        { id: 1, user_id: 3, title: 'Sprint Planning', meeting_type: 'Internal', start_time: new Date(Date.now() - 7200000).toISOString(), end_time: new Date(Date.now() - 3600000).toISOString(), name: 'Employee Alice' }
    ],
    leaves: [
        { id: 1, user_id: 3, leave_type: 'Sick', start_date: '2024-03-20', end_date: '2024-03-21', status: 'Approved', reason: 'Flu', name: 'Employee Alice' }
    ],
    bonuses: [
        { id: 1, employee_id: 3, bonus_amount: 500, bonus_reason: 'Great performance', date_given: '2024-03-01', name: 'Employee Alice' }
    ]
};

module.exports = mockData;

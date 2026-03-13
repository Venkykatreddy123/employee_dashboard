const db = require('../db');

const getDashboardStats = (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { role, id } = req.user;

    const stats = {
        totalEmployees: 0,
        employeesPresentToday: 0,
        employeesOnLeave: 0,
        totalBonuses: 0,
        totalWorkingHoursToday: 0,
        avgProductivityScore: 0
    };

    let queriesCompleted = 0;
    const checkDone = () => {
        queriesCompleted++;
        if (queriesCompleted === 6) {
            res.json(stats);
        }
    };

    // Base filter for Manager: only see their team
    let empFilter = '';
    let empParams = [];
    if (role === 'manager') {
        empFilter = ' WHERE manager_id = ? OR id = ?';
        empParams = [id, id];
    }

    // 1. Total Employees
    db.get(`SELECT COUNT(*) as count FROM employees${empFilter}`, empParams, (err, row) => {
        if (!err && row) stats.totalEmployees = row.count;
        checkDone();
    });

    // 2. Employees Present Today
    let attendanceFilter = ' WHERE date = ?';
    let attendanceParams = [today];
    if (role === 'manager') {
        attendanceFilter += ' AND (employee_id IN (SELECT id FROM employees WHERE manager_id = ?) OR employee_id = ?)';
        attendanceParams.push(id, id);
    }
    db.get(`SELECT COUNT(DISTINCT employee_id) as count FROM attendance${attendanceFilter}`, attendanceParams, (err, row) => {
        if (!err && row) stats.employeesPresentToday = row.count;
        checkDone();
    });

    // 3. Employees On Leave
    let leaveFilter = ' WHERE ? BETWEEN start_date AND end_date AND status = "Approved"';
    let leaveParams = [today];
    if (role === 'manager') {
        leaveFilter += ' AND (employee_id IN (SELECT id FROM employees WHERE manager_id = ?) OR employee_id = ?)';
        leaveParams.push(id, id);
    }
    db.get(`SELECT COUNT(DISTINCT employee_id) as count FROM leaves${leaveFilter}`, leaveParams, (err, row) => {
        if (!err && row) stats.employeesOnLeave = row.count;
        checkDone();
    });

    // 4. Total Bonuses
    let bonusFilter = '';
    let bonusParams = [];
    if (role === 'manager') {
        bonusFilter = ' WHERE (employee_id IN (SELECT id FROM employees WHERE manager_id = ?) OR employee_id = ?)';
        bonusParams = [id, id];
    }
    db.get(`SELECT SUM(bonus_amount) as total FROM bonuses${bonusFilter}`, bonusParams, (err, row) => {
        if (!err && row && row.total) stats.totalBonuses = row.total;
        checkDone();
    });

    // 5. Total Working Hours
    db.get(`SELECT SUM(work_hours) as total FROM attendance${attendanceFilter} AND work_hours IS NOT NULL`, attendanceParams, (err, row) => {
        if (!err && row && row.total) stats.totalWorkingHoursToday = row.total;
        checkDone();
    });

    // 6. Average Productivity Score
    db.get(`SELECT AVG(productivity_score) as avg FROM employees${empFilter}`, empParams, (err, row) => {
        if (!err && row && row.avg) stats.avgProductivityScore = row.avg;
        checkDone();
    });
};

module.exports = { getDashboardStats };

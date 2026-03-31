const { executeQuery } = require('../config/db');

const initializeDatabase = async () => {
  const schemaQueries = [
    `CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('Employee', 'Manager', 'Admin')) NOT NULL,
      department TEXT DEFAULT 'General',
      designation TEXT DEFAULT 'Staff',
      managerId INTEGER,
      FOREIGN KEY (managerId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS SESSIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      status TEXT CHECK(status IN ('active', 'completed')),
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS BREAKS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS LEAVES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
      time TEXT,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS MEETINGS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      time TEXT NOT NULL,
      duration TEXT,
      participants INTEGER,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS SALARIES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      month TEXT NOT NULL,
      year TEXT NOT NULL,
      baseSalary REAL NOT NULL,
      bonus REAL DEFAULT 0,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      netSalary REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS PAYSLIPS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      month TEXT NOT NULL,
      year TEXT NOT NULL,
      baseSalary REAL NOT NULL,
      bonus REAL DEFAULT 0,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      netSalary REAL NOT NULL,
      generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`
  ];

  try {
    await executeQuery('DROP TABLE IF EXISTS salaries');
    await executeQuery('DROP TABLE IF EXISTS SALARIES');
    await executeQuery('DROP TABLE IF EXISTS payslips'); 
    await executeQuery('DROP TABLE IF EXISTS PAYSLIPS'); 
    
    for (const query of schemaQueries) {
      await executeQuery(query);
    }

    // Seed Data
    const usersCount = await executeQuery('SELECT COUNT(*) as count FROM USERS');
    const count = typeof usersCount.rows[0].count === 'bigint' ? Number(usersCount.rows[0].count) : usersCount.rows[0].count;
    
    if (count === 0) {
      const bcrypt = require('bcryptjs');
      console.log('🌱 Turso database is empty. Beginning core initial seed protocol...');
      
      const adminPw = await bcrypt.hash('admin123', 10);
      const mgrPw = await bcrypt.hash('manager123', 10);
      const empPw = await bcrypt.hash('employee123', 10);

      await executeQuery(
        'INSERT INTO USERS (name, email, password, role, department, designation) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@company.com', adminPw, 'Admin', 'Administration', 'Systems Lead']
      );

      // We get the recently inserted manager to act as the employees managerId
      await executeQuery(
        'INSERT INTO USERS (name, email, password, role, department, designation) VALUES (?, ?, ?, ?, ?, ?)',
        ['Manager User', 'manager@company.com', mgrPw, 'Manager', 'Engineering', 'Project Manager']
      );
      
      const mgrRes = await executeQuery('SELECT id FROM USERS WHERE role = ? AND email = ?', ['Manager', 'manager@company.com']);
      const managerId = mgrRes.rows[0].id;

      await executeQuery(
        'INSERT INTO USERS (name, email, password, role, managerId, department, designation) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Employee User', 'employee@company.com', empPw, 'Employee', managerId, 'Engineering', 'Frontend Developer']
      );

      console.log('✅ Base organization structure generated (Admin, Manager, Employee)');
    } else {
      console.log(`✅ System verified: Turso database already holds ${count} valid users.`);
    }

    // Auto-generate payslips if PAYSLIPS is empty
    const payslipsCount = await executeQuery('SELECT COUNT(*) as count FROM PAYSLIPS');
    const pCount = typeof payslipsCount.rows[0].count === 'bigint' ? Number(payslipsCount.rows[0].count) : payslipsCount.rows[0].count;

    if (pCount === 0 && count > 0) {
      console.log('🌱 PAYSLIPS table is empty. Generating sample salaries and payslips for all users...');
      const allUsers = await executeQuery('SELECT id, name, role FROM USERS');
      
      const currentMonthNum = new Date().getMonth() + 1;
      const currentMonth = currentMonthNum.toString().padStart(2, '0');
      const currentYear = new Date().getFullYear().toString();

      for (const user of allUsers.rows) {
        if (user.role === 'Admin') continue;
        
        const baseSalary = 30000;
        const bonus = 0;
        const allowances = baseSalary * 0.10;
        const deductions = baseSalary * 0.05;
        const netSalary = baseSalary + bonus + allowances - deductions;

        await executeQuery(
          'INSERT INTO SALARIES (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user.id, currentMonth, currentYear, baseSalary, bonus, allowances, deductions, netSalary]
        );

        await executeQuery(
          'INSERT INTO PAYSLIPS (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user.id, currentMonth, currentYear, baseSalary, bonus, allowances, deductions, netSalary]
        );
      }
      console.log('✅ Sample salaries and payslips generated successfully.');
    }
  } catch (err) {
    console.error("❌ DB Initialization Failed:", err.message);
  }
};

module.exports = { initializeDatabase };

require('dotenv').config();
const { executeQuery } = require('./config/db');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    const result = await executeQuery('SELECT email, role, password FROM USERS');
    console.log('--- List of Users ---');
    result.rows.forEach(row => {
      console.log(`Email: ${row.email}, Role: ${row.role}`);
    });
    
    // Let's reset the admin password just in case
    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    await executeQuery('UPDATE USERS SET password = ? WHERE email = ?', [hashedAdminPw, 'admin@company.com']);
    console.log('\n✅ Reset admin@company.com password to: admin123');
    
    // Let's reset the manager password
    const hashedMgrPw = await bcrypt.hash('manager123', 10);
    await executeQuery('UPDATE USERS SET password = ? WHERE email = ?', [hashedMgrPw, 'manager@company.com']);
    console.log('✅ Reset manager@company.com password to: manager123');
    
    // Let's reset the employee password
    const hashedEmpPw = await bcrypt.hash('employee123', 10);
    await executeQuery('UPDATE USERS SET password = ? WHERE email = ?', [hashedEmpPw, 'employee@company.com']);
    console.log('✅ Reset employee@company.com password to: employee123');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers();

require('dotenv').config();
const { executeQuery } = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetAllUsers() {
  try {
    const hashedPw = await bcrypt.hash('password123', 10);
    const usersToReset = [
      'admin@test.com',
      'manager@test.com',
      'employee@test.com',
      'admin@company.com',
      'manager@company.com',
      'employee@company.com'
    ];
    
    for (const email of usersToReset) {
      await executeQuery('UPDATE USERS SET password = ? WHERE email = ?', [hashedPw, email]);
      console.log(`✅ Reset ${email} password to: password123`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

resetAllUsers();

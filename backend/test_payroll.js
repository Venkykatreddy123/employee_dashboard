require('dotenv').config();
const { executeQuery } = require('./config/db');
const { generatePayslips } = require('./controllers/adminController');

async function testPayrollSync() {
  try {
    console.log('--- Testing Payroll Sync ---');
    
    // 1. Ensure a user exists
    const userRes = await executeQuery('SELECT id FROM USERS WHERE email = ?', ['employee@test.com']);
    if (userRes.rows.length === 0) {
      console.log('❌ User employee@test.com not found. Please seed the DB.');
      return;
    }
    const userId = userRes.rows[0].id;
    
    const month = '03';
    const year = '2026';
    
    // 2. Add a salary record
    console.log('Adding salary record for userId:', userId);
    await executeQuery(
      'INSERT OR REPLACE INTO SALARIES (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, month, year, 5000, 500, 200, 100, 5600]
    );
    
    // 3. Mock req/res for generatePayslips
    const req = {};
    const res = {
      status: (code) => ({
        json: (data) => console.log(`Response Status ${code}:`, data)
      }),
      json: (data) => console.log('Response Json:', data)
    };
    
    console.log('Running generatePayslips...');
    await generatePayslips(req, res);
    
    // 4. Check if payslip exists
    const payslipRes = await executeQuery('SELECT * FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);
    if (payslipRes.rows.length > 0) {
      console.log('✅ Payslip successfully generated and stored!');
      console.log('Payslip Details:', payslipRes.rows[0]);
    } else {
      console.log('❌ Payslip generation failed.');
    }
    
  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

testPayrollSync();

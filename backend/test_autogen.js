require('dotenv').config();
const { executeQuery } = require('./config/db');
const { getMyPayslips } = require('./controllers/payslipController');

async function testAutoGeneration() {
  try {
    console.log('--- Testing Auto-Generation ---');
    const userId = 9;
    const month = '05';
    const year = '2026';

    // 1. Clean up existing records for this month to start fresh
    await executeQuery('DELETE FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);
    await executeQuery('DELETE FROM SALARIES WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);

    // 2. Add only the salary record
    console.log('Adding salary record for May 2026...');
    await executeQuery(
      'INSERT INTO SALARIES (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, month, year, 40000, 1000, 500, 200, 41300]
    );

    // 3. Verify no payslip exists yet
    const preCheck = await executeQuery('SELECT id FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);
    console.log('Payslip exists before call?', preCheck.rows.length > 0 ? 'YES' : 'NO');

    // 4. Mock req/res for getMyPayslips
    const req = { user: { id: userId } };
    const res = {
      status: (code) => ({
        json: (data) => console.log(`Response Status ${code}:`, data)
      }),
      json: (data) => {
        console.log('Response JSON success?', data.success);
        console.log('Number of payslips returned:', data.payslips.length);
        const hasMay = data.payslips.some(p => p.month === '05' && p.year === '2026');
        console.log('Is May 2026 payslip in result?', hasMay ? '✅ YES (AUTO-GENERATED)' : '❌ NO');
      }
    };

    console.log('Simulating Employee viewing "My Payslips"...');
    await getMyPayslips(req, res);

    // 5. Final check in DB
    const postCheck = await executeQuery('SELECT * FROM PAYSLIPS WHERE userId = ? AND month = ? AND year = ?', [userId, month, year]);
    if (postCheck.rows.length > 0) {
        console.log('✅ DATABASE VERIFIED: Payslip was automatically created!');
    } else {
        console.log('❌ DATABASE ERROR: Payslip was not created.');
    }

  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

testAutoGeneration();

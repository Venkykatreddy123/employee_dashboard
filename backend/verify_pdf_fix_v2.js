require('dotenv').config();
const http = require('http');

async function verifyDownloadAPI() {
  console.log('--- Verifying PDF Download API ---');
  
  const loginData = JSON.stringify({ email: 'employee@test.com', password: 'password123' });
  
  const getToken = () => new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(JSON.parse(data).token));
    });
    req.write(loginData);
    req.end();
  });

  try {
    const token = await getToken();
    
    // Hardcode a known payslip ID or find the latest from DB
    const { executeQuery } = require('./config/db');
    const dbRes = await executeQuery('SELECT id FROM PAYSLIPS WHERE userId = 9 LIMIT 1');
    if (dbRes.rows.length === 0) {
      console.log('❌ No payslips found in DB for test employee.');
      return;
    }
    const payslipId = dbRes.rows[0].id;

    console.log(`Testing download for Payslip ID: ${payslipId}`);

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/payslips/${payslipId}/download`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    
    const req = http.request(options, (res) => {
        console.log('Response Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        
        if (res.statusCode === 200 && res.headers['content-type'] === 'application/pdf') {
            console.log('✅ SUCCESS: API returned a valid PDF stream!');
        } else {
            console.log('❌ FAILED: Status or Content-Type mismatch.');
            // Read error if any
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => console.log('Error content:', data));
        }
    });
    req.end();

  } catch (err) {
    console.error('Verification Error:', err.message);
  }
}

verifyDownloadAPI();

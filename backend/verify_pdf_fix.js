require('dotenv').config();
const http = require('http');

async function verifyDownloadAPI() {
  console.log('--- Verifying PDF Download API ---');
  
  // 1. Get a token first
  const loginData = JSON.stringify({ email: 'employee@test.com', password: 'password123' });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const getToken = () => new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).token));
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  try {
    const token = await getToken();
    console.log('Token obtained.');

    // 2. Fetch a payslip ID for this user
    const getPayslips = () => new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/payslips/my',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).payslips[0].id));
        });
        req.on('error', reject);
        req.end();
    });

    const payslipId = await getPayslips();
    console.log(`Testing download for Payslip ID: ${payslipId}`);

    // 3. Test the download endpoint
    const testDownload = () => new Promise((resolve, reject) => {
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
            console.log('Content-Disposition:', res.headers['content-disposition']);
            
            if (res.statusCode === 200 && res.headers['content-type'] === 'application/pdf') {
                console.log('✅ SUCCESS: API returned a valid PDF stream!');
                resolve(true);
            } else {
                console.log('❌ FAILED: API returned an error or wrong format.');
                resolve(false);
            }
        });
        req.on('error', reject);
        req.end();
    });

    await testDownload();

  } catch (err) {
    console.error('Verification Error:', err.message);
  }
}

verifyDownloadAPI();

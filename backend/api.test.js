

async function runTest() {
  console.log("🚀 Starting Automated API Integation Test...");
  const BASE_URL = 'http://localhost:3000'; // Or whichever port the server binds to...
  
  try {
    // 1. Basic Health Check
    console.log("Checking Backend Health...");
    const health = await fetch('http://localhost:3004/api/health').catch(e => fetch('http://localhost:3000/api/health'));
    const healthJson = await health.json();
    console.log("Health payload:", healthJson);

    // 2. Login as Employee
    console.log("Testing Authentication (Employee)...");
    const loginRes = await fetch('http://localhost:3004/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'employee@test.com', password: 'password123' })
    }).catch(e => fetch('http://localhost:3000/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'employee@test.com', password: 'password123' })
    }));
    
    if(!loginRes.ok) throw new Error("Login failed");
    
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error("No token returned");
    console.log(`✅ Login Success! Token Snippet: ${loginData.token.substring(0, 15)}...`);

    // 3. Fetch My Payslips
    console.log("Attempting to fetch Protected Route (Payslips)...");
    const payslipRes = await fetch('http://localhost:3004/api/payslips/my', {
       headers: { 'Authorization': `Bearer ${loginData.token}` }
    }).catch(e => fetch('http://localhost:3000/api/payslips/my', {
       headers: { 'Authorization': `Bearer ${loginData.token}` }
    }));

    if (!payslipRes.ok) throw new Error("Payslip route rejected auth token.");
    
    const payslipData = await payslipRes.json();
    console.log(`✅ Payslips Rendered! Found ${payslipData.payslips.length} payslips in database.`);

    console.log("🌟 Automated Test Concluded Successfully.");

  } catch (err) {
    console.error("❌ Test Failed:", err.message);
  }
}

runTest();

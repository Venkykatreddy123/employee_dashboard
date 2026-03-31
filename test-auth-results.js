const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function runTest() {
    try {
        console.log('--- Testing Login API ---');
        const loginRes = await axios.post('http://localhost:5050/api/auth/login', {
            email: 'admin@empdash.com',
            password: 'admin123'
        });
        
        console.log('Login Success:', loginRes.data);
        const token = loginRes.data.token;

        console.log('\n--- Testing Auth Me API ---');
        const meRes = await axios.get('http://localhost:5050/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Me Response:', meRes.data);
        
        if (meRes.data.email === 'admin@empdash.com') {
            console.log('\n✅ ALL AUTH TESTS PASSED');
        } else {
            console.log('\n❌ EMAIL MISMATCH IN AUTH ME');
        }
    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    }
}

runTest();

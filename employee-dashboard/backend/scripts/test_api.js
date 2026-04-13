async function test() {
    const URL = 'https://empdashboard.onrender.com/api';
    try {
        const loginRes = await fetch(`${URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'manager', password: 'manager123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed: ' + JSON.stringify(loginData));
        
        console.log('Login successful');
        const token = loginData.token;
        const headers = { Authorization: `Bearer ${token}` };
        
        const teamRes = await fetch(`${URL}/manager/team`, { headers });
        const teamData = await teamRes.json();
        console.log('Team fetch:', teamRes.ok ? 'Success' : 'Failed', teamData.length, 'members');
        console.log(JSON.stringify(teamData, null, 2));

        const attRes = await fetch(`${URL}/manager/attendance`, { headers });
        const attData = await attRes.json();
        console.log('Attendance fetch:', attRes.ok ? 'Success' : 'Failed', attData.message || '');
    } catch (e) {
        console.log('Test failed:', e.message);
    }
}
test();

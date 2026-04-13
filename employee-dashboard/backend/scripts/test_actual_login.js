async function testActualLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });
        const status = response.status;
        const data = await response.json();
        console.log('Login Status:', status);
        console.log('Response body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Login failed!', e);
    } finally {
        process.exit();
    }
}

testActualLogin();

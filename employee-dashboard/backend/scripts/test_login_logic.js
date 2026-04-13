const { db } = require('./db');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        const email = 'admin@example.com';
        const password = 'admin123';
        
        console.log('Testing login for:', email);
        const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });
        
        if (result.rows.length === 0) {
            console.log('User not found');
            return;
        }
        
        const user = result.rows[0];
        console.log('User found in DB. Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (isMatch) {
            console.log('Login logic successful!');
        } else {
            console.log('Password mismatch!');
        }
    } catch (e) {
        console.error('Login simulation failed:', e);
    } finally {
        process.exit();
    }
}

testLogin();

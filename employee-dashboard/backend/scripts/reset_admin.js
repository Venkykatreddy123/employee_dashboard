const { db } = require('../config/db');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await db.execute({
            sql: "UPDATE users SET password = ? WHERE email = ?",
            args: [hashedPassword, 'admin@example.com']
        });
        console.log('Update result:', result);
        
        // Double check what is in the DB
        const check = await db.execute({
            sql: "SELECT email, password FROM users WHERE email = ?",
            args: ['admin@example.com']
        });
        console.log('Current DB state:', check.rows);
    } catch (e) {
        console.error(e);
    }
}

reset();

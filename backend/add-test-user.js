import { db } from './db.js';
import bcrypt from 'bcryptjs';

async function addTestUser() {
    try {
        const salt = await bcrypt.genSalt(10);
        const testPwd = await bcrypt.hash('test1234', salt);
        await db.execute({
            sql: 'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
            args: ['Test User', 'test@user.com', 'employee', testPwd]
        });
        console.log("Inserted test@user.com successfully.");
    } catch(err) {
        console.error(err);
    }
}
addTestUser();

import { db } from './db.js';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
    try {
        const result = await db.execute('SELECT * FROM users');
        const users = result.rows;
        
        const salt = await bcrypt.genSalt(10);
        const testPwd = await bcrypt.hash('test1234', salt);
        const adminPwd = await bcrypt.hash('admin123', salt);
        const managerPwd = await bcrypt.hash('manager123', salt);
        const employeePwd = await bcrypt.hash('employee123', salt);

        for (const user of users) {
            let pwd = testPwd; // default fallback
            if (user.email === 'admin@company.com') pwd = adminPwd;
            else if (user.email === 'manager@company.com') pwd = managerPwd;
            else if (user.email === 'employee@company.com') pwd = employeePwd;
            else if (user.email === 'test@user.com') pwd = testPwd;

            await db.execute({
                sql: 'UPDATE users SET password = ? WHERE id = ?',
                args: [pwd, user.id]
            });
        }
        
        const freshResult = await db.execute('SELECT id, name, email FROM users');
        console.log("Users configured:", freshResult.rows);
    } catch(err) {
        console.error(err);
    }
}
updatePasswords();

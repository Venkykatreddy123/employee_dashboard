import { db } from './db.js';

async function syncUsersToEmployees() {
    try {
        const usersResult = await db.execute('SELECT name, email, role FROM users');
        const users = usersResult.rows;

        for (const user of users) {
            await db.execute({
                sql: 'INSERT INTO employees (name, email, role) VALUES (?, ?, ?)',
                args: [user.name, user.email, user.role]
            });
        }
        console.log(`Synced ${users.length} users into employees table.`);
    } catch(err) {
        console.error(err);
    }
}
syncUsersToEmployees();

import { db } from './db.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { name: 'Admin One', email: 'admin@company.com', role: 'admin' },
            { name: 'Manager One', email: 'manager@company.com', role: 'manager' },
            { name: 'Employee One', email: 'employee@company.com', role: 'employee' }
        ];

        console.log('Seeding initial users...');

        for (const user of users) {
            const result = await db.execute({
                sql: "SELECT * FROM users WHERE email = ?",
                args: [user.email]
            });

            if (result.rows.length === 0) {
                await db.execute({
                    sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    args: [user.name, user.email, hashedPassword, user.role]
                });
                console.log(`User seeded: ${user.email} (${user.role})`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

seed();

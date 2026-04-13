const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const seedUsers = async () => {
    try {
        console.log('Seed process started...');

        const users = [
            { name: process.env.ADMIN_USERNAME || 'admin', email: 'admin@example.com', password: process.env.ADMIN_PASSWORD || 'admin123', role: 'Admin' },
            { name: 'manager', email: 'manager@example.com', password: 'manager123', role: 'Manager' },
            { name: 'employee', email: 'employee@example.com', password: 'employee123', role: 'Employee' }
        ];

        for (const user of users) {
             const hashedPassword = await bcrypt.hash(user.password, 10);
             
             // Try UPDATE (case-insensitive email check)
             const result = await db.execute({
                sql: 'UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?',
                args: [hashedPassword, user.name, user.role, user.email]
             });

             if (result.rowsAffected === 0) {
                 // If no rows affected, INSERT new
                 await db.execute({
                    sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    args: [user.name, user.email, hashedPassword, user.role]
                 });
                 console.log(`User created: ${user.name} (${user.role})`);
             } else {
                 console.log(`User updated: ${user.name} (${user.role})`);
             }
        }

        console.log('Seed process completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedUsers();

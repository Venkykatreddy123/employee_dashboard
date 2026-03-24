import { db } from './db.js';
import bcrypt from 'bcryptjs';

const setup = async () => {
    try {
        console.log('Initializing Turso Tables...');

        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin','manager','employee')) DEFAULT 'employee',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Task 7: Ensure default users exist
        const defaultUsers = [
            { name: 'Admin User', email: 'admin@company.com', password: 'password123', role: 'admin' },
            { name: 'Manager User', email: 'manager@company.com', password: 'password123', role: 'manager' },
            { name: 'Employee User', email: 'employee@company.com', password: 'password123', role: 'employee' }
        ];

        for (const u of defaultUsers) {
            const check = await db.execute({
                sql: 'SELECT id FROM users WHERE email = ?',
                args: [u.email]
            });
            if (check.rows.length === 0) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await db.execute({
                    sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    args: [u.name, u.email, hashedPassword, u.role]
                });
                console.log(`Default user created: ${u.email}`);
            }
        }

        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                check_in DATETIME,
                check_out DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS breaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                break_start DATETIME,
                break_end DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS leaves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                from_date DATE,
                to_date DATE,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS bonuses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                amount INTEGER,
                reason TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                meeting_date DATETIME,
                duration INTEGER,
                notes TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        console.log('Turso Tables Initialized successfully!');
    } catch (error) {
        console.error('Error during Turso setup:', error);
    }
};

setup();

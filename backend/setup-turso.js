import { db } from './db.js';

const setup = async () => {
    try {
        console.log('Initializing Turso Tables...');

        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT CHECK(role IN ('admin','manager','employee')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

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

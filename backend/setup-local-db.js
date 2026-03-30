import { createClient } from "@libsql/client";
import bcrypt from 'bcryptjs';

const db = createClient({
    url: 'file:./datastore.db',
});

async function setupAndSeed() {
    try {
        console.log("Setting up database tables...");

        // Create Users Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'manager', 'employee')) NOT NULL DEFAULT 'employee',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Attendance Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                check_in DATETIME NOT NULL,
                check_out DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Create Leaves Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS leaves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                from_date DATE NOT NULL,
                to_date DATE NOT NULL,
                leave_type TEXT NOT NULL,
                reason TEXT NOT NULL,
                status TEXT CHECK(status IN ('pending', 'Approved', 'Rejected')) NOT NULL DEFAULT 'pending',
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
        
        // Create Breaks Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS breaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                break_start DATETIME NOT NULL,
                break_end DATETIME,
                type TEXT DEFAULT 'Short Break',
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Create Meetings Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                duration INTEGER NOT NULL,
                type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Create System Settings Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);

        // Create Activity Logs Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Tables created successfully.");

        // Clean user table for seeding
        await db.execute('DELETE FROM users');

        // Seed Users
        const salt = await bcrypt.genSalt(10);
        const adminPw = await bcrypt.hash('admin123', salt);
        const managerPw = await bcrypt.hash('manager123', salt);
        const empPw = await bcrypt.hash('employee123', salt);

        await db.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['Admin Node', 'admin@company.com', adminPw, 'admin']
        });

        await db.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['Manager Node', 'manager@company.com', managerPw, 'manager']
        });

        await db.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['Employee Node', 'employee@company.com', empPw, 'employee']
        });

        console.log("Users seeded successfully!");
        
        // Settings seed
        await db.execute(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('SYSTEM_THEME', 'dark')`);
        await db.execute(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('MAINTENANCE_MODE', 'false')`);
        
        console.log("Database successfully seeded.");

    } catch (err) {
        console.error("Database setup failed:", err);
    }
}

setupAndSeed();

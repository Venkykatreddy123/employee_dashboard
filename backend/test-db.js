import { db } from './db.js';

async function verifyDB() {
    try {
        console.log("Connecting to Database...");
        const result = await db.execute('SELECT * FROM users');
        console.log("Users found:", result.rows);
    } catch (error) {
        console.error("Database connection or query failed:", error);
    }
}

verifyDB();

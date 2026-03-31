import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function checkTables() {
    try {
        const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('--- Tables in Database ---');
        result.rows.forEach(row => {
            console.log(row.name);
        });
        console.log('-------------------------');
    } catch (error) {
        console.error('Error checking tables:', error);
    }
}

checkTables();

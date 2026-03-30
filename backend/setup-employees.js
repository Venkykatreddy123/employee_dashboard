import { db } from './db.js';

async function addEmployeesTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL
            )
        `);
        console.log("Employees table created.");
    } catch (e) {
        console.error(e);
    }
}
addEmployeesTable();

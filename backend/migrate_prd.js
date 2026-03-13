const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Running migrations...');

const migrations = [
    "ALTER TABLE employees ADD COLUMN manager_id INTEGER;",
    "ALTER TABLE employees ADD COLUMN productivity_score REAL DEFAULT 0;",
    "ALTER TABLE attendance ADD COLUMN is_manual_override INTEGER DEFAULT 0;",
    "ALTER TABLE breaks ADD COLUMN category TEXT DEFAULT 'Personal';",
    `CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        meeting_subject TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration REAL,
        classification TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY(employee_id) REFERENCES employees(id)
    );`
];

db.serialize(() => {
    migrations.forEach(sql => {
        db.run(sql, (err) => {
            if (err) {
                console.log(`Skipping or Error on: ${sql.substring(0, 30)}... - ${err.message}`);
            } else {
                console.log(`Executed: ${sql.substring(0, 30)}...`);
            }
        });
    });
});

db.close();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database', 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'database', 'schema.sql');

// Connecting to the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database schema and seeds
function initDB() {
    const schema = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schema, async (err) => {
        if (err) {
            console.error('Error executing schema:', err);
            return;
        }

        console.log('Database schema created or already exists.');

        // Seed default admin if not exists
        db.get('SELECT * FROM admins WHERE username = ?', ['admin'], async (err, row) => {
            if (err) {
                console.error('Error checking default admin:', err);
                return;
            }

            if (!row) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword], (err) => {
                    if (err) {
                        console.error('Error creating default admin:', err);
                    } else {
                        console.log('Default admin seeded successfully. (admin / admin123)');
                    }
                });
            }
        });
    });
}

initDB();

module.exports = db;

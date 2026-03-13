const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.get('SELECT * FROM admins WHERE username = ?', ['admin'], async (err, row) => {
    if (err) {
        console.error('Error:', err);
    } else if (row) {
        console.log('Admin found:', row.username);
        console.log('Password hash in DB:', row.password);
        const bcrypt = require('bcrypt');
        const match = await bcrypt.compare('admin123', row.password);
        console.log('Password "admin123" matches:', match);
    } else {
        console.log('Admin NOT found');
    }
    db.close();
});

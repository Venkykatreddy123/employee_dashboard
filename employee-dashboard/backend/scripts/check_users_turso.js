const { db } = require('../config/db');

async function check() {
    try {
        const res = await db.execute("SELECT name, email, role FROM users");
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    }
}

check();

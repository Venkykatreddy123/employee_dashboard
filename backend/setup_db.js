const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'employee_dashboard',
    port: process.env.PG_PORT || 5432,
});

const schemaPath = path.join(__dirname, 'database', 'postgresql_schema.sql');

async function setupDB() {
    try {
        console.log('Starting PostgreSQL setup...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual queries if needed, but pg pool.query handles multiple if config allows
        // Here we'll just run them and handle errors
        await pool.query(schema);
        console.log('Schema executed successfully.');

        // Seed default admin
        const adminEmail = 'admin@example.com';
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Get Admin role id
        const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
        const adminRoleId = roleResult.rows[0].id;

        const checkAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        
        if (checkAdmin.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (name, email, password, role_id, department) VALUES ($1, $2, $3, $4, $5)',
                ['System Admin', adminEmail, hashedPassword, adminRoleId, 'IT']
            );
            console.log('Default admin seeded (admin@example.com / admin123)');
        } else {
            console.log('Admin already exists.');
        }

        console.log('Database setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDB();

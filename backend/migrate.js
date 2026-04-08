require('dotenv').config();
const { executeQuery } = require('./config/db');

const migrate = async () => {
    try {
        console.log('Running migration...');
        
        // Add duration to MEETINGS if not exists
        try {
            await executeQuery('ALTER TABLE MEETINGS ADD COLUMN duration TEXT');
            console.log('Added duration to MEETINGS');
        } catch (e) {
            console.log('duration already exists or failed:', e.message);
        }

        // Add participants to MEETINGS if not exists
        try {
            await executeQuery('ALTER TABLE MEETINGS ADD COLUMN participants INTEGER');
            console.log('Added participants to MEETINGS');
        } catch (e) {
            console.log('participants already exists or failed:', e.message);
        }

        // Add department to USERS
        try {
            await executeQuery('ALTER TABLE USERS ADD COLUMN department TEXT DEFAULT "Engineering"');
            console.log('Added department to USERS');
        } catch (e) {
            console.log('department in USERS already exists or failed:', e.message);
        }

        // Add designation to USERS
        try {
            await executeQuery('ALTER TABLE USERS ADD COLUMN designation TEXT DEFAULT "Developer"');
            console.log('Added designation to USERS');
        } catch (e) {
            console.log('designation in USERS already exists or failed:', e.message);
        }

        // Create 'payslips' table as requested
        try {
            // Check if table has 'employee_id' -- if not, drop and recreate properly
            const tableCheck = await executeQuery("PRAGMA table_info(payslips)");
            const hasEmployeeId = tableCheck.rows.some(r => r.name === 'employee_id');

            if (!hasEmployeeId && tableCheck.rows.length > 0) {
                console.log('Old payslips table version found. Dropping to recreate with new schema.');
                await executeQuery('DROP TABLE payslips');
            }

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS payslips (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id INTEGER NOT NULL,
                    employee_name TEXT NOT NULL,
                    department TEXT,
                    designation TEXT,
                    month TEXT NOT NULL,
                    year TEXT NOT NULL,
                    basic_salary REAL NOT NULL,
                    allowances REAL DEFAULT 0,
                    bonuses REAL DEFAULT 0,
                    deductions REAL DEFAULT 0,
                    net_salary REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Verified/Created payslips table with correct schema');
        } catch (e) {
            console.log('Error managing payslips table:', e.message);
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
};

migrate();

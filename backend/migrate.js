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

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
};

migrate();

const { executeQuery } = require('./config/db');

const checkSchema = async () => {
    try {
        const tablesResult = await executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        console.log('Tables in database:');
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.name;
            console.log(`\nStructure of ${tableName}:`);
            const columnResult = await executeQuery(`PRAGMA table_info(${tableName})`);
            columnResult.rows.forEach(row => {
                console.log(`- ${row.name} (${row.type})`);
            });
        }
    } catch (err) {
        console.error('Failed to check schema:', err);
    } finally {
        process.exit(0);
    }
};

checkSchema();

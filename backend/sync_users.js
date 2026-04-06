const { client } = require('./config/db');
const bcrypt = require('bcryptjs');

async function syncUsers() {
    try {
        console.log('🔄 [Users Sync] Initializing strategic identity migration...');

        // 1. Check if emp_id column exists. If not, add it.
        const usersTableInfo = await client.execute('PRAGMA table_info(users)');
        const hasEmpId = usersTableInfo.rows.some(r => r.name === 'emp_id');

        if (!hasEmpId) {
            console.log('🏗️ [Users Sync] Infrastructure update: Adding emp_id column to users registry...');
            await client.execute('ALTER TABLE users ADD COLUMN emp_id TEXT');
        } else {
            console.log('✅ [Users Sync] Infrastructure verified: emp_id column present.');
        }

        // 2. Fetch all employees to sync with users registry
        const employees = await client.execute('SELECT emp_id, name, email, password, role FROM employees');
        console.log(`📋 [Users Sync] Personnel Registry contains ${employees.rows.length} records.`);

        for (const emp of employees.rows) {
            // Find existing user by email
            const existingUser = await client.execute({
                sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
                args: [emp.email]
            });

            const hashedPassword = emp.password.startsWith('$2') 
                ? emp.password 
                : await bcrypt.hash(emp.password, 10);

            if (existingUser.rows.length > 0) {
                console.log(`🔗 [Users Sync] Linking existing node: ${emp.email} -> ${emp.emp_id}`);
                await client.execute({
                    sql: "UPDATE users SET emp_id = ?, password = ?, role = ?, name = ? WHERE email = ?",
                    args: [emp.emp_id, hashedPassword, emp.role || 'Employee', emp.name, emp.email]
                });
            } else {
                console.log(`✨ [Users Sync] Provisioning new identity: ${emp.email} (${emp.emp_id})`);
                await client.execute({
                    sql: "INSERT INTO users (email, password, role, emp_id, name) VALUES (?, ?, ?, ?, ?)",
                    args: [emp.email, hashedPassword, emp.role || 'Employee', emp.emp_id, emp.name]
                });
            }
            
            // Also update the employee password to be hashed for consistency if it wasn't
            if (emp.password !== hashedPassword) {
                await client.execute({
                    sql: "UPDATE employees SET password = ? WHERE emp_id = ?",
                    args: [hashedPassword, emp.emp_id]
                });
            }
        }

        console.log('🎉 [Users Sync] Migration protocols COMPLETED. Infrastructure is now unified.');
        process.exit(0);

    } catch (err) {
        console.error('🔥 [Users Sync] Fatal Synchronization Error:', err.message);
        process.exit(1);
    }
}

syncUsers();

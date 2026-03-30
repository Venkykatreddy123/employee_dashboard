import { db } from './db.js';

async function setupSalaryTables() {
    try {
        console.log("Setting up Salary and Payslip tables...");

        // Create Salaries Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                base_salary REAL DEFAULT 0,
                bonus REAL DEFAULT 0,
                deductions REAL DEFAULT 0,
                net_salary REAL DEFAULT 0,
                month TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(employee_id) REFERENCES users(id)
            )
        `);

        // Create Payslips Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payslips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                salary_id INTEGER NOT NULL,
                month TEXT NOT NULL,
                generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(employee_id) REFERENCES users(id),
                FOREIGN KEY(salary_id) REFERENCES salaries(id)
            )
        `);

        console.log("Adding sample data...");

        // Seed some starter data for admin, manager, employee
        const { rows } = await db.execute('SELECT id, role, name, email FROM users');
        
        for (const user of rows) {
            // Give them a starter salary
            const existing = await db.execute({
                sql: 'SELECT id FROM salaries WHERE employee_id = ? AND month = ?',
                args: [user.id, 'March']
            });
            
            if (existing.rows.length === 0) {
                let base = user.role === 'admin' ? 85000 : user.role === 'manager' ? 65000 : 45000;
                let bonus = 5000;
                let deduct = 2500;
                let net = base + bonus - deduct;

                const inserted = await db.execute({
                    sql: 'INSERT INTO salaries (employee_id, base_salary, bonus, deductions, net_salary, month) VALUES (?, ?, ?, ?, ?, ?)',
                    args: [user.id, base, bonus, deduct, net, 'March']
                });

                await db.execute({
                    sql: 'INSERT INTO payslips (employee_id, salary_id, month) VALUES (?, ?, ?)',
                    args: [user.id, inserted.lastInsertRowid, 'March']
                });
            }
        }

        console.log("Salary schema ready and seeded.");
    } catch (e) {
        console.error(e);
    }
}
setupSalaryTables();

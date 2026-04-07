const { client } = require('./db');

/**
 * setupDatabase - Final Comprehensive Schema Initialization
 * Enforces a complete organizational registry across Turso Cloud.
 */
const setupDatabase = async () => {
    try {
        console.log('🏗️  Enforcing Master Data Schema [Identity Registry]...');

        // 0. Migration Safeguard: Inspect Employees Table
        const empTableInfo = await client.execute("PRAGMA table_info(employees)");
        const hasEmpId = empTableInfo.rows.some(r => r.name === 'emp_id');
        const hasPassword = empTableInfo.rows.some(r => r.name === 'password');
        const hasManagerId = empTableInfo.rows.some(r => r.name === 'manager_id');
        
        if (empTableInfo.rows.length > 0 && (!hasEmpId || !hasPassword || !hasManagerId)) {
            console.log('🔄 Outdated Employee Schema detected. Migrating to full registry...');
            await client.execute("DROP TABLE employees");
        }

        // 0.1 Inspection of Attendance Table
        const attendInfo = await client.execute("PRAGMA table_info(attendance)");
        const hasEmployeeId = attendInfo.rows.some(r => r.name === 'employee_id');
        
        if (attendInfo.rows.length > 0 && !hasEmployeeId) {
            console.log('🔄 Outdated Attendance Schema detected. Migrating to Employee Registry standard...');
            await client.execute("DROP TABLE attendance");
        }

        // 0.2 Inspection of Leaves Table
        const leaveInfo = await client.execute("PRAGMA table_info(leaves)");
        const hasEmployeeIdLeave = leaveInfo.rows.some(r => r.name === 'employee_id');
        const hasFromDate = leaveInfo.rows.some(r => r.name === 'from_date');
        
        if (leaveInfo.rows.length > 0 && (!hasEmployeeIdLeave || !hasFromDate)) {
            console.log('🔄 Outdated Leaves Schema detected. Migrating to production standard...');
            await client.execute("DROP TABLE leaves");
        }

        // 1. Core Identity Registry (Employees)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Employee',
                department TEXT DEFAULT 'Engineering',
                joining_date TEXT,
                salary REAL DEFAULT 0,
                manager_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
            )
        `);

        // 2. Strategic Infrastructure (Projects)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                budget REAL DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                status TEXT DEFAULT 'Active',
                tech_stack TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Relational Assignments
        await client.execute(`
            CREATE TABLE IF NOT EXISTS project_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL,
                employee_id TEXT NOT NULL,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 4. Performance Metrics
        await client.execute(`
            CREATE TABLE IF NOT EXISTS performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                review_date TEXT NOT NULL,
                comments TEXT,
                FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 5. Financial Infrastructure (Salaries)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                base_salary REAL NOT NULL,
                bonus REAL DEFAULT 0,
                deductions REAL DEFAULT 0,
                month TEXT NOT NULL,
                year TEXT NOT NULL,
                status TEXT DEFAULT 'Paid',
                generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 6. Operational Handshakes (Attendance)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                date TEXT NOT NULL,
                check_in_time TEXT,
                check_out_time TEXT,
                total_hours REAL DEFAULT 0,
                status TEXT DEFAULT 'Absent',
                FOREIGN KEY (employee_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 7. Time Logic (Breaks)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS breaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                break_start TEXT,
                break_end TEXT,
                duration_minutes INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 8. Lifecycle Management (Leaves)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS leaves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                from_date TEXT NOT NULL,
                to_date TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'Pending'
            )
        `);

        // 9. Meeting Logs Infrastructure (New as requested)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                meeting_date TEXT NOT NULL,
                duration INTEGER DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 10. Financial Incentives Registry (Bonuses)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS bonuses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                amount REAL DEFAULT 0,
                reason TEXT,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 10a. Active Sessions Registry (Required by Admin Dashboard)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                device TEXT,
                ip_address TEXT,
                FOREIGN KEY (user_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);

        // 10b. Organizational Hierarchy (Departments)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                manager_id TEXT,
                FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
            )
        `);

        // 10c. System Audit Registry (Audit Logs)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                details TEXT
            )
        `);

        // 10d. Global Infrastructure Settings
        await client.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL
            )
        `);

        // Seed initial settings if blank
        const settingsCheck = await client.execute("SELECT COUNT(*) as count FROM settings");
        if (settingsCheck.rows[0].count === 0) {
            console.log('⚙️  Initializing Infrastructure Settings...');
            const defaultSettings = [
                ['SYSTEM_MODE', 'Production'],
                ['MAINTENANCE_WINDOW', '02:00 - 04:00 UTC'],
                ['CLOUD_REGION', 'AP-SOUTH-1'],
                ['IDENTITY_PROTOCOL', 'JWT High-Integrity']
            ];
            for (const s of defaultSettings) {
                await client.execute({
                    sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
                    args: s
                });
            }
        }

        // 11. Core Auth Registry (Users)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'Employee'
            )
        `);

        // 12. Strategic Synchronization: [Autosync Triggers]
        // This ensures the Identity Registry (Employees) and Auth Tier (Users) are ALWAYS synchronized.
        console.log('⛓️  Forging Persistence Triggers [Identity ↔ Auth]...');
        
        // A. Insert Sync
        await client.execute(`
            CREATE TRIGGER IF NOT EXISTS sync_user_insert
            AFTER INSERT ON employees
            BEGIN
                INSERT OR IGNORE INTO users (email, password, role)
                VALUES (new.email, new.password, new.role);
            END;
        `);

        // B. Update Sync
        await client.execute(`
            CREATE TRIGGER IF NOT EXISTS sync_user_update
            AFTER UPDATE ON employees
            BEGIN
                UPDATE users 
                SET email = new.email, 
                    password = new.password, 
                    role = new.role
                WHERE email = old.email;
            END;
        `);

        // C. Delete Sync
        await client.execute(`
            CREATE TRIGGER IF NOT EXISTS sync_user_delete
            AFTER DELETE ON employees
            BEGIN
                DELETE FROM users WHERE email = old.email;
            END;
        `);

        // 13. Data Integrity: Bulk Alignment
        // Manually align existing records before triggers handle future flow
        console.log('🔄 Aligning Legacy Identity Clusters...');
        await client.execute(`
            INSERT OR IGNORE INTO users (email, password, role)
            SELECT email, password, role FROM employees
        `);

        // 14. Core Seeding Logic
        console.log('🌱 Checking Master Registry for core personnel...');
        const userCheck = await client.execute("SELECT COUNT(*) as count FROM employees");
        if (userCheck.rows[0].count === 0) {
            console.log('🌱 Registry empty. Initializing strategic personnel data...');
            const personnel = [
                ["EMP001", "Admin User", "admin@empdash.com", "admin123", "Admin", "Executive", "2024-01-01", 120000],
                ["EMP002", "Jane Manager", "jane@empdash.com", "manager123", "Manager", "Engineering", "2024-01-15", 95000],
                ["EMP003", "Robert HR", "robert@empdash.com", "hr123", "HR", "Corporate", "2024-02-01", 85000],
                ["EMP004", "Alice Employee", "alice@empdash.com", "emp123", "Employee", "Design", "2024-03-01", 60000]
            ];
            for (const u of personnel) {
                // We only insert into employees; triggers handle the rest
                await client.execute({
                    sql: "INSERT INTO employees (emp_id, name, email, password, role, department, joining_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    args: u
                });
            }

            console.log('✅ Identity & Auth Registry Initialized.');
        } else {
            console.log('✅ Personnel Registry active. Autosync active.');
        }

        console.log('✅ Final Cloud Schema Synchronized.');
    } catch (error) {
        console.error('❌ Schema Sync Failure:', error.message);
    }
};

module.exports = setupDatabase;

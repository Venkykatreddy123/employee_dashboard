const { db } = require('./db');

const seedManagerData = async () => {
    try {
        console.log('--- SEEDING MANAGER DATA TO TURSO ---');

        // 1. Create a project
        const projectResult = await db.execute({
            sql: `INSERT INTO projects (project_name, description, start_date, end_date, progress, status, manager_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: ['Mobile App Revamp', 'Redesigning the main customer app.', '2026-03-01', '2026-06-30', 45, 'In Progress', 2]
        });
        const projectId1 = Number(projectResult.lastInsertRowid);
        console.log(`Created Project 1: ID ${projectId1}`);

        const projectResult2 = await db.execute({
            sql: `INSERT INTO projects (project_name, description, start_date, end_date, progress, status, manager_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: ['HR System Integration', 'Integrating legacy data.', '2026-01-15', '2026-04-10', 85, 'Completed', 2]
        });
        const projectId2 = Number(projectResult2.lastInsertRowid);
        console.log(`Created Project 2: ID ${projectId2}`);

        // 2. Create tasks
        const tasks = [
            { project_id: projectId1, title: 'UI Mockups', description: 'Design mobile mocks' },
            { project_id: projectId1, title: 'API Integration', description: 'Connect backend APIs' },
            { project_id: projectId2, title: 'Data Migration', description: 'Import legacy data' }
        ];

        for (const t of tasks) {
            const taskResult = await db.execute({
                sql: `INSERT INTO tasks (project_id, title, description) VALUES (?, ?, ?)`,
                args: [t.project_id, t.title, t.description]
            });
            const taskId = Number(taskResult.lastInsertRowid);
            
            // Assign to Employee (ID 3)
            await db.execute({
                sql: `INSERT INTO task_assignments (task_id, employee_id, status) VALUES (?, ?, ?)`,
                args: [taskId, 3, 'in-progress']
            });
            console.log(`Created Task "${t.title}" and assigned to Employee ID 3`);
        }

        // 3. Project Allotments
        await db.execute({
            sql: `INSERT INTO project_assignments (project_id, employee_id, assigned_by) VALUES (?, ?, ?)`,
            args: [projectId1, 3, 2]
        });
        await db.execute({
            sql: `INSERT INTO project_assignments (project_id, employee_id, assigned_by) VALUES (?, ?, ?)`,
            args: [projectId2, 3, 2]
        });

        console.log('✅ Manager seed data inserted successfully to Turso.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedManagerData();


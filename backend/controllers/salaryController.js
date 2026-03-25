const { client } = require('../config/db');
const PDFDocument = require('pdfkit');

/**
 * createSalary - Admin-only payroll disbursement
 */
exports.createSalary = async (req, res) => {
    const { emp_id, base_salary, bonus, deductions, month, year } = req.body;
    console.log(`📡 API: POST /api/salary (${emp_id})`);

    try {
        if (!emp_id || !base_salary || !month || !year) {
            return res.status(400).json({ success: false, message: 'Strategic financial components required' });
        }

        // Insert financial record into Turso Cloud Registry
        await client.execute({
            sql: "INSERT INTO salaries (emp_id, base_salary, bonus, deductions, month, year, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [emp_id, base_salary, bonus || 0, deductions || 0, month, year, 'Paid']
        });

        res.status(201).json({ success: true, message: 'Financial Portfolio Persisted' });
    } catch (err) {
        console.error('🔥 Salary Disbursement Error:', err.message);
        res.status(500).json({ success: false, message: 'Financial registry suspended' });
    }
};

/**
 * getEmployeeSalaries - Fetch historical financial registry for personnel
 */
exports.getEmployeeSalaries = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/salary/${id}`);
    try {
        const query = await client.execute({
            sql: "SELECT * FROM salaries WHERE emp_id = ? ORDER BY year DESC, month DESC",
            args: [id]
        });
        res.json({ success: true, data: query.rows });
    } catch (err) {
        console.error('🔥 Salary Registry Sync Error:', err.message);
        res.status(500).json({ success: false, message: 'Financial registry suspended' });
    }
};

/**
 * generatePayslip - High-fidelity PDF document generation
 */
exports.generatePayslip = async (req, res) => {
    const { id, month, year } = req.params; // emp_id, month, year
    console.log(`📡 API: GET /api/salary/${id}/payslip/${month}-${year}`);
    
    try {
        const userQuery = await client.execute({
            sql: "SELECT name, emp_id, email, role, department FROM users WHERE emp_id = ?",
            args: [id]
        });
        
        const salaryQuery = await client.execute({
            sql: "SELECT * FROM salaries WHERE emp_id = ? AND month = ? AND year = ? LIMIT 1",
            args: [id, month, year]
        });

        if (userQuery.rows.length === 0 || salaryQuery.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Financial record not found' });
        }

        const user = userQuery.rows[0];
        const sal = salaryQuery.rows[0];
        const total = Number(sal.base_salary || 0) + Number(sal.bonus || 0) - Number(sal.deductions || 0);

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payslip_${id}_${month}_${year}.pdf`);
        doc.pipe(res);

        // Header Section
        doc.fillColor('#0ea5e9').fontSize(24).text('Organizational Payslip', { align: 'center' }).moveDown();
        doc.fillColor('#000').fontSize(10).text(`Cloud Registry Timestamp: ${new Date().toISOString()}`, { align: 'center' }).moveDown(2);

        // Personnel Profile Section
        doc.fontSize(12).font('Helvetica-Bold').text('Personnel Profile:').moveDown(0.5);
        doc.font('Helvetica').fontSize(10)
           .text(`Digital ID: ${user.emp_id}`)
           .text(`Name: ${user.name}`)
           .text(`Email: ${user.email}`)
           .text(`Strategic Role: ${user.role}`)
           .text(`Department: ${user.department}`).moveDown(2);

        // Infrastructure Section
        doc.font('Helvetica-Bold').fontSize(12).text('Financial Infrastructure:').moveDown(0.5);
        doc.font('Helvetica').fontSize(10)
           .text(`Fiscal Period: ${month} ${year}`)
           .text(`Status: ${sal.status}`).moveDown(1.5);

        // Table logic
        const col1 = 50; const col2 = 300;
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
        doc.text('Strategic Component', col1).text('Allocation ($)', col2, doc.y - 12);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
        
        doc.text('Base Deployment Salary', col1).text(Number(sal.base_salary || 0).toLocaleString(), col2, doc.y - 12).moveDown(0.5);
        doc.text('Performance Bonus', col1).text(Number(sal.bonus || 0).toLocaleString(), col2, doc.y - 12).moveDown(0.5);
        doc.fillColor('#ef4444').text('Strategic Deductions', col1).text(`-${Number(sal.deductions || 0).toLocaleString()}`, col2, doc.y - 12).moveDown(1);
        
        doc.fillColor('#0ea5e9').font('Helvetica-Bold').fontSize(14)
           .text('Net Portfolio Allocation', col1).text(`$${total.toLocaleString()}`, col2, doc.y - 16);

        // Handshake
        doc.moveDown(4);
        doc.fillColor('#94a3b8').fontSize(8).text('Automatically generated via Turso Cloud Registry Infrastructure.', { align: 'center' });
        doc.text('Digital Signature Synchronized.', { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('🔥 PDF Generation Link Failed:', err.message);
        res.status(500).json({ success: false, message: 'Document generation suspended' });
    }
};

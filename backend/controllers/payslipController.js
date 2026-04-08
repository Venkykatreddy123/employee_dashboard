const { executeQuery } = require('../config/db');
const PDFDocument = require('pdfkit');

/**
 * Generate monthly payslips for ALL employees (POST /api/payslips/generate)
 * Admin only
 */
const generateMonthlyPayslips = async (req, res) => {
    try {
        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear().toString();

        // 1. Fetch all employees
        const employeesResult = await executeQuery('SELECT id, name, department, designation FROM USERS');
        const employees = employeesResult.rows;

        let generatedCount = 0;
        let skippedCount = 0;

        for (const emp of employees) {
            // Check if payslip already exists for this month/year
            const existing = await executeQuery(
                'SELECT id FROM payslips WHERE employee_id = ? AND month = ? AND year = ?',
                [emp.id, month, year]
            );

            if (existing.rows.length > 0) {
                skippedCount++;
                continue;
            }

            // 2. Fetch salary details for this employee for the current month
            // If not found for current month, try to find the most recent one
            let salaryResult = await executeQuery(
                'SELECT * FROM SALARIES WHERE userId = ? AND month = ? AND year = ?',
                [emp.id, month, year]
            );

            let salary = salaryResult.rows[0];

            if (!salary) {
                // Try to find the latest salary record
                const latestSalaryResult = await executeQuery(
                    'SELECT * FROM SALARIES WHERE userId = ? ORDER BY year DESC, month DESC LIMIT 1',
                    [emp.id]
                );
                salary = latestSalaryResult.rows[0];
            }

            // If no salary record found at all, we could either skip or use default 0s
            // Given the requirement "generate for ALL", I'll use 0s if nothing found
            const basic_salary = salary ? salary.baseSalary : 0;
            const allowances = salary ? (salary.allowances || 0) : 0;
            const bonuses = salary ? (salary.bonus || 0) : 0;
            const deductions = salary ? (salary.deductions || 0) : 0;
            const net_salary = basic_salary + allowances + bonuses - deductions;

            // 3. Store the generated payslip
            await executeQuery(
                `INSERT INTO payslips (
                    employee_id, employee_name, department, designation, 
                    month, year, basic_salary, allowances, bonuses, 
                    deductions, net_salary
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    emp.id, emp.name, emp.department || 'Engineering', emp.designation || 'Employee',
                    month, year, basic_salary, allowances, bonuses,
                    deductions, net_salary
                ]
            );
            generatedCount++;
        }

        res.status(201).json({
            success: true,
            message: `Generated ${generatedCount} payslips for ${month}/${year}. ${skippedCount} already existed.`,
            details: { generated: generatedCount, skipped: skippedCount, period: `${month}/${year}` }
        });

    } catch (err) {
        console.error('❌ Payslip Generation Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error generating payslips', error: err.message });
    }
};

/**
 * Fetch all payslips for the logged-in employee (GET /api/payslips/employee/:employeeId)
 */
const getEmployeePayslips = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const loggedInUserId = req.user.id;
        const role = req.user.role;

        // Security check: Employee can only see their own. Admin/Manager can see others (optional enhancement)
        if (role !== 'Admin' && parseInt(employeeId) !== loggedInUserId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const result = await executeQuery(
            'SELECT * FROM payslips WHERE employee_id = ? ORDER BY year DESC, month DESC',
            [employeeId]
        );

        res.json({ success: true, payslips: result.rows });
    } catch (err) {
        console.error('❌ Fetch Payslips Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching payslips', error: err.message });
    }
};

/**
 * Fetch all payslips for the manager's team (GET /api/manager/team-payslips)
 */
const getTeamPayslips = async (req, res) => {
    try {
        const managerId = req.user.id;
        const result = await executeQuery(`
            SELECT p.* 
            FROM payslips p
            JOIN USERS u ON p.employee_id = u.id
            WHERE u.managerId = ?
            ORDER BY p.year DESC, p.month DESC, p.created_at DESC
        `, [managerId]);

        res.json({ success: true, payslips: result.rows });
    } catch (err) {
        console.error('❌ Fetch Team Payslips Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching team payslips', error: err.message });
    }
};

/**
 * Fetch all payslips belonging to the logged-in user (GET /api/payslips/my)
 */
const getMyPayslips = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await executeQuery(
            'SELECT * FROM payslips WHERE employee_id = ? ORDER BY year DESC, month DESC',
            [userId]
        );
        res.json({ success: true, payslips: result.rows });
    } catch (err) {
        console.error('❌ Fetch My Payslips Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching my payslips', error: err.message });
    }
};

/**
 * Generate and download professional PDF for a specific payslip (GET /api/payslips/:id/download)
 */
const downloadPayslipPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        // Fetch payslip details
        const result = await executeQuery('SELECT * FROM payslips WHERE id = ?', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        const payslip = result.rows[0];

        // RBAC: Admin can download all, Employee only own, Manager can download team
        if (role !== 'Admin' && payslip.employee_id !== userId) {
            if (role === 'Manager') {
                // Check if this employee belongs to this manager
                const empCheck = await executeQuery('SELECT managerId FROM USERS WHERE id = ?', [payslip.employee_id]);
                if (empCheck.rows.length === 0 || empCheck.rows[0].managerId !== userId) {
                    return res.status(403).json({ success: false, message: 'Access denied: Employee not in your team' });
                }
            } else {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        // File Naming
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthIndex = parseInt(payslip.month, 10) - 1;
        const monthName = monthNames[monthIndex] || payslip.month;
        const safeName = payslip.employee_name.replace(/\s+/g, '_');
        const filename = `${safeName}_${monthName}_${payslip.year}_Payslip.pdf`;

        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);

        // Header
        doc.fillColor('#4f46e5').fontSize(24).font('Helvetica-Bold').text('EMP LOGIC', { align: 'center' });
        doc.fillColor('#334155').fontSize(16).text('Monthly Payslip', { align: 'center' });
        doc.fontSize(12).text(`${monthName} ${payslip.year}`, { align: 'center' });
        doc.moveDown(1.5);
        
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        // Employee Details
        doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('EMPLOYEE DETAILS');
        doc.moveDown(0.5);
        
        const detailsTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('Name:', 50, detailsTop);
        doc.font('Helvetica').text(payslip.employee_name, 150, detailsTop);
        doc.font('Helvetica-Bold').text('ID:', 300, detailsTop);
        doc.font('Helvetica').text(`EMP-${payslip.employee_id.toString().padStart(3, '0')}`, 400, detailsTop);
        
        const secondRowTop = detailsTop + 20;
        doc.font('Helvetica-Bold').text('Department:', 50, secondRowTop);
        doc.font('Helvetica').text(payslip.department || 'N/A', 150, secondRowTop);
        doc.font('Helvetica-Bold').text('Designation:', 300, secondRowTop);
        doc.font('Helvetica').text(payslip.designation || 'N/A', 400, secondRowTop);
        doc.moveDown(2);

        // Salary Table
        const tableTop = doc.y;
        doc.fillColor('#4f46e5').rect(50, tableTop, 495, 25).fill();
        doc.fillColor('#ffffff').font('Helvetica-Bold').text('Earnings', 55, tableTop + 7);
        doc.text('Amount', 240, tableTop + 7);
        doc.text('Deductions', 310, tableTop + 7);
        doc.text('Amount', 485, tableTop + 7);

        let currentY = tableTop + 35;
        const rowHeight = 20;

        const earnings = [
            { label: 'Basic Salary', val: payslip.basic_salary },
            { label: 'Allowances', val: payslip.allowances },
            { label: 'Bonuses', val: payslip.bonuses }
        ];

        const deductions = [
            { label: 'Total Deductions', val: payslip.deductions }
        ];

        const maxRows = Math.max(earnings.length, deductions.length);
        doc.fillColor('#1e293b').font('Helvetica');

        for (let i = 0; i < maxRows; i++) {
            if (earnings[i]) {
                const val = Number(earnings[i].val || 0);
                doc.text(earnings[i].label, 55, currentY);
                doc.text(`$${val.toLocaleString()}`, 240, currentY);
            }
            if (deductions[i]) {
                const val = Number(deductions[i].val || 0);
                doc.text(deductions[i].label, 310, currentY);
                doc.text(`$${val.toLocaleString()}`, 485, currentY);
            }
            currentY += rowHeight;
            doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, currentY - 5).lineTo(545, currentY - 5).stroke();
        }

        currentY += 10;
        doc.font('Helvetica-Bold');
        doc.text('Grand Total', 55, currentY);
        const grandTotal = Number(payslip.basic_salary || 0) + Number(payslip.allowances || 0) + Number(payslip.bonuses || 0);
        doc.text(`$${grandTotal.toLocaleString()}`, 240, currentY);
        
        currentY += 30;
        doc.fillColor('#eef2ff').rect(50, currentY, 495, 35).fill();
        doc.fillColor('#4f46e5').fontSize(14).text('Net Salary Payable', 60, currentY + 10);
        const netSal = Number(payslip.net_salary || 0);
        doc.fontSize(16).font('Helvetica-Bold').text(`$${netSal.toLocaleString()}`, 400, currentY + 10, { width: 140, align: 'right' });
        
        currentY += 60;
        doc.fillColor('#64748b').fontSize(10).font('Helvetica');
        doc.text(`Generated On: ${new Date(payslip.created_at).toLocaleDateString()}`, 50, currentY);
        doc.text('Authorized Signature', 400, currentY, { align: 'right' });
        doc.moveDown(0.2);
        doc.text('______________________', 400, doc.y, { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(8).text('This is a system generated payslip.', 50, doc.y, { align: 'center', width: 495 });

        doc.end();
    } catch (err) {
        console.error('❌ PDF Error:', err.message);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
};

module.exports = { 
    generateMonthlyPayslips, 
    getEmployeePayslips, 
    getMyPayslips, 
    getTeamPayslips,
    downloadPayslipPDF 
};

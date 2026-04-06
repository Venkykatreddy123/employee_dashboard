const { executeQuery } = require('../config/db');
const PDFDocument = require('pdfkit');

/**
 * Fetch all payslips belonging to the logged-in employee (GET /api/payslips/my)
 */
/**
 * Fetch all payslips belonging to the logged-in employee (GET /api/payslips/my)
 * Feature: Auto-generation of payslips from existing salary records
 */
const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. AUTO-GENERATION LOGIC:
    // Check if there are salary records that don't have corresponding payslips yet
    const pendingSalaries = await executeQuery(`
        SELECT s.* FROM SALARIES s
        LEFT JOIN PAYSLIPS p ON s.userId = p.userId AND s.month = p.month AND s.year = p.year
        WHERE s.userId = ? AND p.id IS NULL
    `, [userId]);

    if (pendingSalaries.rows.length > 0) {
        console.log(`[PAYSLIP AUTO-GEN] Syncing ${pendingSalaries.rows.length} pending records for userId: ${userId}`);
        for (const salary of pendingSalaries.rows) {
            const netSalary = salary.baseSalary + (salary.bonus || 0) + (salary.allowances || 0) - (salary.deductions || 0);
            await executeQuery(
                'INSERT INTO PAYSLIPS (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, salary.month, salary.year, salary.baseSalary, salary.bonus || 0, salary.allowances || 0, salary.deductions || 0, netSalary]
            );
        }
    }

    // 2. FETCH LIST:
    const result = await executeQuery(`
      SELECT * FROM PAYSLIPS
      WHERE userId = ?
      ORDER BY year DESC, month DESC, generatedAt DESC
    `, [userId]);

    res.json({ success: true, payslips: result.rows });
  } catch (err) {
    console.error('❌ Auto-Gen Payout Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching my payslips', error: err.message });
  }
};


/**
 * Fetch all payslips for the manager's team (GET /api/manager/team-payslips)
 */
/**
 * Fetch all payslips for the manager's team (GET /api/manager/team-payslips)
 * Feature: Auto-generation/sync on fly for team records
 */
const getTeamPayslips = async (req, res) => {
  try {
    const managerId = req.user.id;

    // 1. AUTO-GENERATION SYNC:
    const pendingTeamSalaries = await executeQuery(`
        SELECT s.* FROM SALARIES s
        JOIN USERS u ON s.userId = u.id
        LEFT JOIN PAYSLIPS p ON s.userId = p.userId AND s.month = p.month AND s.year = p.year
        WHERE u.managerId = ? AND p.id IS NULL
    `, [managerId]);

    if (pendingTeamSalaries.rows.length > 0) {
        for (const salary of pendingTeamSalaries.rows) {
            const netSalary = salary.baseSalary + (salary.bonus || 0) + (salary.allowances || 0) - (salary.deductions || 0);
            await executeQuery(
                'INSERT INTO PAYSLIPS (userId, month, year, baseSalary, bonus, allowances, deductions, netSalary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [salary.userId, salary.month, salary.year, salary.baseSalary, salary.bonus || 0, salary.allowances || 0, salary.deductions || 0, netSalary]
            );
        }
    }

    // 2. FETCH LIST:
    const result = await executeQuery(`
      SELECT P.*, U.name as employeeName, U.department, U.role
      FROM PAYSLIPS P
      JOIN USERS U ON P.userId = U.id
      WHERE U.managerId = ?
      ORDER BY P.year DESC, P.month DESC, P.generatedAt DESC
    `, [managerId]);

    res.json({ success: true, payslips: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching team payslips', error: err.message });
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

    // Fetch payslip details and user details
    const result = await executeQuery(`
      SELECT P.*, U.name, U.email, U.department, U.role as userRole, U.designation, U.managerId
      FROM PAYSLIPS P
      JOIN USERS U ON P.userId = U.id
      WHERE P.id = ?
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payslip record not found' });
    }

    const payslip = result.rows[0];

    // RBAC: Admin can download all, Manager can download team, Employee only own
    if (role !== 'Admin') {
        if (role === 'Manager') {
            // Check if employee belongs to manager's team
            if (payslip.managerId !== userId && payslip.userId !== userId) {
                return res.status(403).json({ success: false, message: 'Access denied: You can only download payslips for your team members.' });
            }
        } else if (role === 'Employee') {
            if (payslip.userId !== userId) {
                return res.status(403).json({ success: false, message: 'Access denied: You can only download your own payslips.' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }
    }

    // Calculations
    const totalEarnings = payslip.baseSalary + (payslip.bonus || 0) + (payslip.allowances || 0);
    const totalDeductions = payslip.deductions || 0;
    const netSalary = payslip.netSalary || (totalEarnings - totalDeductions);

    // File Naming Format: EmployeeName_Month_Year_Payslip.pdf
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = parseInt(payslip.month, 10) - 1;
    const monthName = monthNames[monthIndex] || payslip.month;
    
    const safeName = payslip.name.replace(/\s+/g, '_');
    const filename = `${safeName}_${monthName}_${payslip.year}_Payslip.pdf`;

    // Create PDF
    const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50
    });
    
    // Response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- PDF DESIGN ---

    // 1. HEADER
    doc.fillColor('#4f46e5').fontSize(24).font('Helvetica-Bold').text('EMP LOGIC', { align: 'center' });
    doc.fillColor('#334155').fontSize(16).text('Employee Salary Payslip', { align: 'center' });
    doc.fontSize(12).text(`${monthName} ${payslip.year}`, { align: 'center' });
    doc.moveDown(1.5);
    
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // 2. EMPLOYEE DETAILS
    doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('EMPLOYEE DETAILS');
    doc.moveDown(0.5);
    
    const detailsTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Employee Name:', 50, detailsTop);
    doc.font('Helvetica').text(payslip.name, 150, detailsTop);
    
    doc.font('Helvetica-Bold').text('Employee ID:', 300, detailsTop);
    doc.font('Helvetica').text(`EMP-${payslip.userId.toString().padStart(3, '0')}`, 400, detailsTop);
    
    const secondRowTop = detailsTop + 20;
    doc.font('Helvetica-Bold').text('Department:', 50, secondRowTop);
    doc.font('Helvetica').text(payslip.department || 'Engineering', 150, secondRowTop);
    
    doc.font('Helvetica-Bold').text('Designation:', 300, secondRowTop);
    doc.font('Helvetica').text(payslip.designation || 'Developer', 400, secondRowTop);
    
    doc.moveDown(2);

    // 3. SALARY BREAKDOWN TABLE
    const tableTop = doc.y;
    doc.fillColor('#4f46e5').rect(50, tableTop, 495, 25).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').text('Earnings', 55, tableTop + 7);
    doc.text('Amount', 240, tableTop + 7);
    doc.text('Deductions', 310, tableTop + 7);
    doc.text('Amount', 485, tableTop + 7);

    let currentY = tableTop + 35;
    const rowHeight = 20;

    // Derived Breakdown
    const hra = Math.round(payslip.baseSalary * 0.4);
    const basic = payslip.baseSalary;
    const bonus = payslip.bonus || 0;
    const allowances = (payslip.allowances || 0) - hra; // Simple split

    const pf = Math.round(totalDeductions * 0.4);
    const insurance = Math.round(totalDeductions * 0.1);
    const tax = totalDeductions - pf - insurance;

    const earnings = [
        { label: 'Basic Salary', val: basic },
        { label: 'HRA', val: hra },
        { label: 'Bonus', val: bonus },
        { label: 'Allowances', val: Math.max(0, allowances) }
    ];

    const deductions = [
        { label: 'Income Tax', val: tax },
        { label: 'PF', val: pf },
        { label: 'Insurance', val: insurance }
    ];

    const maxRows = Math.max(earnings.length, deductions.length);
    doc.fillColor('#1e293b').font('Helvetica');

    for (let i = 0; i < maxRows; i++) {
        if (earnings[i]) {
            doc.text(earnings[i].label, 55, currentY);
            doc.text(`$${earnings[i].val.toLocaleString()}`, 240, currentY);
        }
        if (deductions[i]) {
            doc.text(deductions[i].label, 310, currentY);
            doc.text(`$${deductions[i].val.toLocaleString()}`, 485, currentY);
        }
        currentY += rowHeight;
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, currentY - 5).lineTo(545, currentY - 5).stroke();
    }

    currentY += 10;

    // 4. SUMMARY
    doc.font('Helvetica-Bold');
    doc.text('Total Earnings', 55, currentY);
    doc.text(`$${totalEarnings.toLocaleString()}`, 240, currentY);
    
    doc.text('Total Deductions', 310, currentY);
    doc.text(`$${totalDeductions.toLocaleString()}`, 485, currentY);
    
    currentY += 30;
    
    // Net Salary Box
    doc.fillColor('#eef2ff').rect(50, currentY, 495, 35).fill();
    doc.fillColor('#4f46e5').fontSize(14).text('Net Salary Payable', 60, currentY + 10);
    doc.fontSize(16).font('Helvetica-Bold').text(`$${netSalary.toLocaleString()}`, 400, currentY + 10, { width: 140, align: 'right' });
    
    currentY += 60;

    // 5. FOOTER
    doc.fillColor('#64748b').fontSize(10).font('Helvetica');
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 50, currentY);
    
    doc.text('Authorized Signature', 400, currentY, { align: 'right' });
    doc.moveDown(0.2);
    doc.text('______________________', 400, doc.y, { align: 'right' });
    doc.moveDown(2);
    
    doc.fontSize(8).text('This is a system generated payslip and does not require a physical signature.', 50, doc.y, { align: 'center', width: 495 });

    doc.end();

  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating payslip', error: err.message });
    }
  }
};

module.exports = { getMyPayslips, getTeamPayslips, downloadPayslipPDF };



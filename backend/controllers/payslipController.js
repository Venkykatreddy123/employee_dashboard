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
 * Generate and download PDF for a specific payslip (GET /api/payslips/:id/download)
 */
const downloadPayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Fetch payslip details and user details
    const result = await executeQuery(`
      SELECT P.*, U.name, U.email, U.department, U.role, U.designation
      FROM PAYSLIPS P
      JOIN USERS U ON P.userId = U.id
      WHERE P.id = ?
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    const payslip = result.rows[0];

    // Security check: Only the employee themselves, their manager, or an admin can download
    if (role !== 'Admin' && payslip.userId !== userId) {
        // Check if it's manager
        const managerCheck = await executeQuery('SELECT id FROM USERS WHERE id = ? AND managerId = ?', [payslip.userId, userId]);
        if (managerCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    // Define filename
    const filename = `Payslip_${payslip.name.replace(/\s+/g, '_')}_${payslip.month}_${payslip.year}.pdf`;

    // Create PDF
    const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: { Title: filename, Author: 'EMP Logic HR' }
    });
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);


    // Header Background Header
    doc.fillColor('#f8fafc').rect(0, 0, doc.page.width, 140).fill();

    // Company Brand
    doc.fillColor('#4f46e5').fontSize(26).font('Helvetica-Bold').text('EMP LOGIC', 50, 40);
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('ENTERPRISE MANAGEMENT PLATFORM', 50, 70);
    
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('PAYROLL STATEMENT', 350, 45, { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Period: ${payslip.month} ${payslip.year}`, 350, 65, { align: 'right' });
    doc.text(`Generated On: ${new Date(payslip.generatedAt).toLocaleDateString()}`, 350, 80, { align: 'right' });

    doc.moveDown(5);
    let currentY = 160;

    // Divider
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;

    // Employee & Company Details Section
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('RECIPIENT', 50, currentY);
    doc.text('PAYER INFORMATION', 350, currentY);
    
    currentY += 15;
    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(payslip.name, 50, currentY);
    doc.text('EMP LOGIC INC.', 350, currentY);
    
    currentY += 15;
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`ID: EMP-${payslip.userId.toString().padStart(4, '0')}`, 50, currentY);
    doc.text('HQ - Tech Park Avenue', 350, currentY);
    
    currentY += 12;
    doc.text(`Dept: ${payslip.department || 'General'}`, 50, currentY);
    doc.text(`Role: ${payslip.role || 'Staff'}`, 50, currentY + 12);
    doc.text('support@emplogic.io', 350, currentY);
    
    currentY += 50;

    // Summary Box
    doc.fillColor('#f8fafc').rect(50, currentY, 500, 60).fill();
    doc.fillColor('#4f46e5').fontSize(10).font('Helvetica-Bold').text('TOTAL NET PAYOUT', 70, currentY + 15);
    doc.fontSize(22).text(`$${payslip.netSalary.toLocaleString()}`, 70, currentY + 30);
    
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('STATUS', 380, currentY + 15);
    doc.fillColor('#10b981').fontSize(14).font('Helvetica-Bold').text('PROCESSED', 380, currentY + 30);

    currentY += 90;

    // Earnings & Deductions Table
    doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('Earnings Breakdown', 50, currentY);
    currentY += 20;
    
    const addTableRow = (label, amt, isBold = false) => {
        doc.fillColor(isBold ? '#1e293b' : '#475569').fontSize(10).font(isBold ? 'Helvetica-Bold' : 'Helvetica');
        doc.text(label, 60, currentY);
        doc.text(`$${amt.toLocaleString()}`, 450, currentY, { align: 'right', width: 100 });
        currentY += 20;
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(55, currentY - 5).lineTo(545, currentY - 5).stroke();
    };

    addTableRow('Base Salary', payslip.baseSalary);
    addTableRow('Bonus', payslip.bonus || 0);
    addTableRow('Allowances', payslip.allowances || 0);
    addTableRow('Deductions', -(payslip.deductions || 0));
    
    currentY += 10;
    doc.fillColor('#f1f5f9').rect(50, currentY, 500, 30).fill();
    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('Total Net Earnings', 65, currentY + 10);
    doc.text(`$${payslip.netSalary.toLocaleString()}`, 450, currentY + 10, { align: 'right', width: 100 });

    // Footer
    doc.moveDown(5);
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('Electronic Payroll Receipt. This document is system generated and does not require a signature.', 50, 750, { align: 'center', width: 500 });
    doc.text('EMP LOGIC - Secure Employee Management Portal', 50, 765, { align: 'center', width: 500 });

    doc.end();

  } catch (err) {
    console.error('❌ PDF Error:', err.message);
    res.status(500).json({ success: false, message: 'Error generating PDF', error: err.message });
  }
};

module.exports = { getMyPayslips, getTeamPayslips, downloadPayslipPDF };


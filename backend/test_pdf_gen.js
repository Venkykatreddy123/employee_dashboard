const PDFDocument = require('pdfkit');
const fs = require('fs');

const payslip = {
    name: 'John Doe',
    month: 'March',
    year: '2026',
    generatedAt: new Date().toISOString(),
    userId: 1,
    department: 'Engineering',
    role: 'Employee',
    netSalary: 5500,
    baseSalary: 5000,
    bonus: 500,
    allowances: 200,
    deductions: 200
};

const filename = 'test_payslip.pdf';
const doc = new PDFDocument({ 
    size: 'A4',
    margin: 50,
    info: { Title: filename, Author: 'EMP Logic HR' }
});

const stream = fs.createWriteStream(filename);
doc.pipe(stream);

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

stream.on('finish', () => {
    console.log('PDF generated successfully!');
});

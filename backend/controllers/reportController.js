const db = require('../db');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const exportCSV = async (req, res) => {
    const { type } = req.params; // productivity or team
    const { id, role } = req.user;

    try {
        let query = '';
        if (type === 'productivity') {
            query = `SELECT ws.*, u.name, u.email FROM work_sessions ws JOIN users u ON ws.user_id = u.id`;
            if (role === 'employee') query += ' WHERE ws.user_id = $1';
        } else {
            query = `SELECT u.name, u.email, u.department, u.productivity_score FROM users u`;
        }

        const result = await db.query(query, role === 'employee' ? [id] : []);
        
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(result.rows);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${type}_report_${new Date().getTime()}.csv`);
        return res.send(csv);

    } catch (err) {
        console.error('CSV Export error:', err);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};

const exportPDF = async (req, res) => {
    const { type } = req.params;
    const { id, role } = req.user;

    try {
        let query = '';
        if (type === 'productivity') {
            query = `SELECT ws.*, u.name FROM work_sessions ws JOIN users u ON ws.user_id = u.id`;
            if (role === 'employee') query += ' WHERE ws.user_id = $1';
        } else {
            query = `SELECT name, email, department, productivity_score FROM users`;
        }

        const result = await db.query(query, role === 'employee' ? [id] : []);

        const doc = new PDFDocument();
        res.header('Content-Type', 'application/pdf');
        res.attachment(`${type}_report_${new Date().getTime()}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text('Employee Productivity Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        result.rows.forEach(row => {
            doc.text(`User: ${row.name || row.email}`);
            if (row.login_time) doc.text(`Log: ${row.login_time} - ${row.logout_time || 'Active'}`);
            if (row.productivity_score) doc.text(`Productivity Score: ${row.productivity_score}`);
            doc.moveDown(0.5);
            doc.text('-----------------------------------');
            doc.moveDown(0.5);
        });

        doc.end();

    } catch (err) {
        console.error('PDF Export error:', err);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
};

module.exports = { exportCSV, exportPDF };

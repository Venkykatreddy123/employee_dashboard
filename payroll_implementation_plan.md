# Payroll System Upgrade Plan

## 1. Database Schema Verification
- Confirm `USERS`, `SALARIES`, and `PAYSLIPS` tables match the required structure.
- Ensure `managerId` exists in `USERS` for team filtering.

## 2. Backend Enhancements
- **Admin Controller (`adminController.js`)**:
  - Implement `generatePayslips` to scan `SALARIES` and create `PAYSLIPS`.
  - Fix any `RETURNING` clause issues if they arise.
- **Payslip Controller (`payslipController.js`)**:
  - Refine `downloadPayslipPDF` using `pdfkit` to match the required visual template (Header, Employee Details, Table, Footer).
  - Ensure `getMyPayslips` and `getTeamPayslips` use efficient joins.
- **Routes**:
  - Double-check all route registrations in `server.js`.

## 3. Frontend Global Synchronization
- **Admin Dashboard**:
  - `SalaryManagement.jsx`: Fix "Generate Monthly Payslips" button and ensure it refreshes the view.
- **Employee Dashboard**:
  - `Payslip.jsx`: Ensure correct API fetching (`/api/payslips/my`) and PDF download triggers.
- **Manager Dashboard**:
  - `TeamPayslips.jsx`: Fix API URL from `/api/payslips/team` to `/api/team-payslips`.

## 4. Testing & Validation
- Run integration tests for generation and download via the browser.

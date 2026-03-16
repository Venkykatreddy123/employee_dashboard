
# 🏢 Employee Management System (EMS)

A modern, high-performance dashboard for managing employees, projects, and tasks. Built with a focus on real-time data visualization and efficient administration.

## 🚀 Key Features

- **Admin Dashboard**: Comprehensive overview of workforce status, active projects, and upcoming tasks.
- **Employee Portal**: Personalized view for employees to track their tasks, projects, and schedules.
- **Project Tracking**: Manage multiple projects with progress monitoring and team assignments.
- **Task Management**: Kanban-style or list-based task tracking for efficient workflow management.
- **Real-time Analytics**: Visualized data using Recharts for workforce status and project completion.
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS and Lucide icons.

## 🛠️ Tech Stack

- **Frontend Core**: React 19, Vite
- **Styling**: Tailwind CSS 4, Lucide React
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Utilities**: Date-fns, CLSX, Tailwind Merge

## 📦 Project Structure

```text
src/
├── components/     # Reusable UI components (Sidebar, Layout, etc.)
├── pages/          # Main dashboard views (Admin, Employee, Tasks, etc.)
├── store/          # Zustand state management (Auth, App state)
├── lib/            # Utility functions and shared logic
├── assets/         # Static images and icons
└── App.jsx         # Main application routing and entry
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Employee
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Execution

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License.
# Nexus HR: Employee Productivity & Analytics Dashboard
# CloudOps - Enterprise Workforce Analytics Dashboard

CloudOps is a production-ready Employee Productivity and Workforce Analytics system built with React, Node.js, PostgreSQL, and MongoDB.

## Features
- **Time Tracking**: Automated login/logout capture and manual corrections.
- **Idle Detection**: Automatic tracking of unproductive time.
- **Break Tracking**: Categorized sessions (Lunch, Coffee, Personal).
- **Meeting Logs**: Classification of internal, client, and team syncs.
- **Productivity Analytics**: Advanced scoring formula with trend charts.
- **Leave Management**: Full approval workflow with history.
- **RBAC**: Role-Based Access Control (Admin, Manager, Employee).
- **Reporting**: CSV/PDF export for individual and team performance.

## Tech Stack
- **Frontend**: React.js, Recharts, Premium Glassmorphism CSS.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Core Data), MongoDB (Audit Logs).
- **Auth**: JWT with Role-based protection.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI.

## API Documentation

### Auth
- `POST /api/auth/login`: Authenticate and receive JWT.

### Attendance
- `POST /api/attendance/checkin`: Start a work session.
- `POST /api/attendance/checkout`: End a work session.
- `PUT /api/attendance/idle`: Update idle time for active session.
- `GET /api/attendance`: View attendance logs (RBAC filtered).

### Breaks & Meetings
- `POST /api/break/start`: Start a break.
- `POST /api/break/end`: End a break.
- `POST /api/meetings`: Log a meeting.

### Analytics & Reports
- `GET /api/dashboard/stats`: High-level dashboard metrics.
- `GET /api/dashboard/analytics`: 30-day productivity trend.
- `GET /api/reports/csv/:type`: Export CSV report.
- `GET /api/reports/pdf/:type`: Export PDF report.

## Setup Instructions

### local Development
1. Clone the repository.
2. Setup environment variables in `backend/.env`.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Initialize PostgreSQL:
   ```bash
   npm run setup-db
   ```
5. Start servers:
   ```bash
   npm run dev (backend)
   npm run dev (frontend)
   ```

### Docker Deployment
```bash
docker-compose up --build
```

## 🛠️ Tech Stack
- **Frontend**: React, Vite, CSS3 (Vanilla + Glassmorphism), Bootstrap (Structural).
- **Backend**: Node.js, Express, JWT Authentication, bcrypt.
- **Database**: SQLite (Zero-config, embedded).

## 📈 Development Process
1. **Foundation**: Established a robust Node/Express backend with SQLite and JWT auth.
2. **Feature Phase**: Built out core modules for Attendance, Breaks, and Projects.
3. **Modernization**: Transformed the UI from a basic layout to a premium "Nexus Premium" design.
4. **Theme Pivot**: Transitioned from a dark theme to the "Vibrant Light" aesthetic requested, focusing on clarity, vibrant accents, and a flexible grid layout for the dashboard.
5. **Optimization**: Refined all components to ensure responsive behavior and visual consistency across the entire platform.

---
Built with Nexus Design Principles.
## Security
- JWT for all protected routes.
- Salted password hashing with BCrypt.
- Role-based middleware for management endpoints.
- Activity logging in MongoDB for audit trails.

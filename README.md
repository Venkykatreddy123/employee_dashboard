<<<<<<< HEAD
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
=======
# Nexus HR: Employee Productivity & Analytics Dashboard

Nexus HR is a premium, enterprise-grade platform designed for modern organizations to track employee productivity, attendance, and collaborative sessions with transparency and style.

## 🚀 Key Features
- **Operational Dashboard**: Real-time telemetry grid with key performance indicators.
- **Attendance Management**: Automated and manual shift tracking with "Checkpoint" precision.
- **Break Tracker**: Categorized recovery cycle management (Lunch, Coffee, Personal).
- **Meeting Log**: Collaborative session tracking with classification and duration metrics.
- **Leave Management**: Standardized request and resolution workflow for absences.
- **Personnel Induction**: Full management lifecycle for employees, managers, and admins.
- **Vibrant Light Design**: A high-end, modern UI/UX featuring glassmorphism (Frost), smooth animations, and premium typography (Outfit).

## 📂 Project Structure

```bash
nexus-hr/
├── backend/            # Express.js & SQLite API
│   ├── controllers/    # Request handling logic
│   ├── database/       # DB migrations and storage
│   ├── middleware/     # JWT Authentication & security
│   ├── models/         # Data schema definitions
│   ├── routes/         # API endpoint definitions
│   └── server.js       # Backend entry point
└── frontend/           # React 18 & Vite
    ├── src/
    │   ├── api/        # API communication (Axios)
    │   ├── components/ # Reusable UI blocks (Tables, Nav)
    │   ├── pages/      # Full-page views
    │   ├── App.css     # Layout-specific styling
    │   ├── App.jsx     # Routing and core structure
    │   └── index.css   # Global "Vibrant Light" design system
    └── index.html      # SPA root
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
>>>>>>> f0ca16ecd1534fd8315152816ff55a5ececa5118

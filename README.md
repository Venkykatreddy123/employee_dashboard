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

# 💠 EMP ADMIN: Senior Employee Management Dashboard

A full-stack, enterprise-grade Employee Productivity and Presence Management system. Built with **React**, **Node.js (Express)**, and **Turso (LibSQL/SQLite)**, featuring **JWT-powered Security Protocols** and role-based operational oversight.

---

## 🚀 Key Evolutionary Features

### 🔐 Multi-Tier Authorization
- **Admin**: Full system override, user synchronization, enterprise-wide attendance monitoring, and leave adjudication.
- **Manager**: Team directory oversight, performance tracking, and rest cycle management.
- **Employee**: Individual "Mission Hub" with session tracking, leave applications, and productivity logs.

### 📊 Real-Time Workforce Intelligence
- **Workforce Presence Tracker**: Live check-in/out session monitoring.
- **Human Fatigue Management**: Rest cycle (Break) tracking with "Active/In-Recovery" status indicators.
- **Absence Management Terminal**: Multi-stage leave protocol with classification (Sick, Vacation, etc.) and audit trails.
- **Productivity Analytics**: Visual chart representation of the team's operational output.

### 🛡️ Security Pillars
- **JWT Protection**: All API traffic is secured with JSON Web Tokens.
- **Personnel Encryption**: Passwords are automatically hashed via `bcrypt`.
- **Session Interceptors**: Client-side axios interceptors handle token injection and automatic logout on session expiration (401/403).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Axios, Lucide Icons, Chart.js, Bootstrap (Glassmorphism UI) |
| **Backend** | Node.js, Express, JWT, Bcrypt, Dotenv |
| **Database** | Turso (LibSQL) - Edge-ready SQLite architecture |

---

## ⚙️ Initial Deployment Protocol

### 1. Database Initialization
Ensure your Turso credentials are set in the backend environment.
```bash
cd backend
npm install
node setup-turso.js
```
*This command initializes the `users`, `attendance`, `leaves`, `breaks`, `bonuses`, and `meetings` protocols.*

### 2. Backend Orchestration
Configure `.env` in the `/backend` directory:
- `PORT=5001`
- `JWT_SECRET=your_secure_secret`
- `TURSO_DATABASE_URL=libsql://your-db-url.turso.io`
- `TURSO_AUTH_TOKEN=your_turso_token`

```bash
npm run dev
```

### 3. Frontend Activation
Initialize the interactive cockpit.
```bash
cd frontend
npm install
npm start
```

---

## 🔑 Personnel Debug Keys (Default)

| Role | System Identifier | Access Key |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `password123` |
| **Manager** | `manager@company.com` | `password123` |
| **Employee** | `employee@company.com` | `password123` |

---

## 📁 System Architecture
```text
├── frontend/
│   ├── src/
│   │   ├── api/          # Secure Axios configuration & Interceptors
│   │   ├── components/   # Modular UI elements (Sidebar, Navbar, Charts)
│   │   └── pages/        # Role-specific operational terminals
├── backend/
│   ├── controllers/      # Handshake and Data Logic
│   ├── models/           # LibSQL Database Models
│   ├── routes/           # Protected API endpoints
│   └── middleware/       # Auth validation & Token decoding
└── database/
    └── schema.sql        # Canonical blueprint for workforce data
```

---

## ⚖️ Operational Protocols
- **Attendance**: Sessions must be "Concluded" via check-out for accurate hour calculation.
- **Leaves**: Use the "Initialize Protocol" button. Admins must "Review & Adjudicate" before a status transitions from `pending`.
- **Breaks**: Designed for "Human Fatigue Management". Tracks "In-Recovery" vs "Resumed" states.

---
*Maintained by Team Sravani - Enterprise Operational Systems.*

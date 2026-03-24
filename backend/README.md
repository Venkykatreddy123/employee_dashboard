# ⚙️ EMP ADMIN: Backend Operational Manual

This is the central nervous system of the Employee Management Dashboard, providing a performant and secure API layer for workforce synchronization.

---

## 🔐 Core Security Handshake

### JWT Authentication
- **Protocol**: `Authorization: Bearer <token>`
- **Encryption**: `jwt.sign` with a 24h expiration.
- **Middleware**: `authMiddleware.js` verifies identity before granting access to protected routes.

---

## 📡 API Operational Catalogue

### 1. Unified Identity (`/api/users`)
- `GET /`: Lists all personnel (Admin/Manager restricted).
- `POST /`: Initializes a new user protocol (Auto-generated UUID/ID).
- `PUT /:id`: Synchronizes profile updates.
- `DELETE /:id`: Deactivates personnel records.

### 2. Session Presence (`/api/attendance`)
- `POST /check-in`: Starts a new workforce session.
- `POST /check-out`: Concludes an active session and calculates hour delta.
- `GET /`: Monitors real-time presence.

### 3. Rest Cycle Tracking (`/api/breaks`)
- `POST /start`: Initiates a rest interval.
- `POST /end`: Resumes session and updates "Human Fatigue" logs.

### 4. Absence Protocols (`/api/leaves`)
- `POST /`: Submits a new leave request.
- `PUT /:id`: Adjudicates statuses (Approved/Rejected) - Admin/Manager only.

---

## 🗄️ Persistence Architecture (LibSQL)

The system utilizes **Turso (LibSQL)** for edge-ready data integrity.
- **Models**: Located in `/models`, these files manage all direct database interaction via `db.execute`.
- **Initialization**: Run `node setup-turso.js` to build indices and seed default personnel.

---

## 🔄 Development Synchronization
1. Ensure `.env` is configured with `JWT_SECRET` and Turso credentials.
2. Monitor system logs in real-time via `npm run dev`.
3. Critical database updates must be mirrored in `database/schema.sql` for canonical audit.

---
*Operational Engineering - Secure Workforce Systems.*

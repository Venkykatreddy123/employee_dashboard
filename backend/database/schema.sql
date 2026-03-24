-- Master Users Table (Auto-generated IDs)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin','manager','employee')) DEFAULT 'employee',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workforce Presence tracking
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Human Fatigue Management (Breaks)
CREATE TABLE IF NOT EXISTS breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    break_start DATETIME,
    break_end DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Absence Management Protocols
CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_date DATE,
    to_date DATE,
    leave_type TEXT,
    reason TEXT,
    status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance & Incentives (Bonuses)
CREATE TABLE IF NOT EXISTS bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    date_given DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Operational Meetings Log
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    meeting_date DATETIME,
    duration INTEGER, -- in minutes
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default Personnel Initialization
-- Passwords should be hashed in production via the setup-turso seeding logic.
-- admin@company.com / password123
-- manager@company.com / password123
-- employee@company.com / password123

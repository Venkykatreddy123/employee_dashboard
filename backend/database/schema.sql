CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    department TEXT,
    salary REAL,
    joining_date TEXT,
    manager_id INTEGER,
    productivity_score REAL DEFAULT 0,
    FOREIGN KEY(manager_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT,
    work_hours REAL,
    date TEXT NOT NULL,
    is_manual_override INTEGER DEFAULT 0,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    break_start TEXT NOT NULL,
    break_end TEXT,
    break_duration REAL,
    date TEXT NOT NULL,
    category TEXT DEFAULT 'Personal', -- Added per PRD (Lunch, Coffee, etc.)
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    meeting_subject TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration REAL,
    classification TEXT, -- Client, Internal, Sync
    date TEXT NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    bonus_amount REAL NOT NULL,
    bonus_reason TEXT,
    date_given TEXT NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);

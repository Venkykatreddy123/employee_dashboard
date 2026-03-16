const { Pool } = require('pg');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const mockData = require('./utils/mockData');

dotenv.config();

let useMock = false;

// PostgreSQL Connection Pool
const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'employee_dashboard',
    port: process.env.PG_PORT || 5432,
    connectionTimeoutMillis: 2000, // Faster failure for demo
});

pool.on('error', (err) => {
    console.warn('PostgreSQL Pool Error:', err.message);
    useMock = true;
});

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_activity_logs';
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.warn('Could not connect to MongoDB. Logging will be functional in memory/mock.');
    }
};

connectMongoDB();

const mockQuery = (text, params) => {
    console.log('[MOCK QUERY]', text, params);
    
    // Normalize text for easier matching
    const query = text.toLowerCase();
    
    if (query.includes('count(*) from users')) {
        return { rows: [{ count: mockData.users.length }] };
    }
    if (query.includes('count(distinct user_id) from work_sessions')) {
        return { rows: [{ count: 2 }] }; // Mock 2 active users
    }
    if (query.includes('avg(productivity_score) from users')) {
        return { rows: [{ avg: 88.5 }] };
    }
    if (query.includes('from users') && query.includes('email = $1')) {
        const user = mockData.users.find(u => u.email === params[0]);
        return { rows: user ? [user] : [] };
    }
    if (query.includes('select u.*, r.name as role_name from users')) {
        return { rows: mockData.users };
    }
    if (query.includes('select name, email, department from users')) {
        return { rows: mockData.users.map(({name, email, department}) => ({name, email, department})) };
    }
    if (query.includes('select b.*, u.name from bonuses')) {
        return { rows: mockData.bonuses };
    }
    if (query.includes('from leaves')) {
        return { rows: mockData.leaves };
    }
    if (query.includes('from meetings')) {
        return { rows: mockData.meetings };
    }
    if (query.includes('from break_sessions')) {
        return { rows: mockData.break_sessions };
    }
    if (query.includes('from work_sessions')) {
        return { rows: mockData.work_sessions };
    }
    if (query.includes('insert into')) {
        return { rows: [{ id: Date.now() }] };
    }
    if (query.includes('update')) {
        return { rows: [{ id: params ? params[params.length - 1] : 999 }] };
    }

    return { rows: [] };
};

module.exports = {
    query: async (text, params) => {
        if (useMock) return mockQuery(text, params);
        try {
            return await pool.query(text, params);
        } catch (err) {
            // Check for connection refused, aggregate error, or timeout
            if (err.code === 'ECONNREFUSED' || 
                err.name === 'AggregateError' || 
                err.message.includes('connect') ||
                err.message.includes('timeout')) {
                useMock = true;
                console.warn('PostgreSQL Unavailable. Switching to Demo Mode.');
                return mockQuery(text, params);
            }
            console.error('Database query error:', err);
            throw err;
        }
    },
    pool,
    mongoose,
    isMock: () => useMock
};

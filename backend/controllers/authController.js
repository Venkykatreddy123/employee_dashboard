import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// Helper to find a user by email
const findUserByEmail = async (email) => {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

// Register
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields (name, email, password, role) are required!' });
    }

    if (!['admin', 'manager', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role! Must be admin, manager, or employee.' });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: [name, email, hashedPassword, role]
        });

        res.status(201).json({
            message: 'User registered successfully!',
            userId: Number(result.lastInsertRowid)
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration', error: error.message });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth Controller] Login attempt for Email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            console.warn(`[Auth Controller] ❌ User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        console.log(`[Auth Controller] User found. Authentging...`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`[Auth Controller] ❌ Password mismatch for: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        const secret = process.env.JWT_SECRET || 'supersecretkey123';
        console.log(`[Auth Controller] ✅ Authentication successful. Generating Token...`);
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '24h' }
        );

        console.log(`[Auth Controller] ✅ Token generated successfully. Returning to client.`);

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[Auth Controller] ❌ Login sequence failure:', error);
        res.status(500).json({ message: 'Internal Server Error during login', error: error.message });
    }
};

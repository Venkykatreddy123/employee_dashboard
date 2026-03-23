import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.getById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

export const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const users = await User.getAll();
        const exists = users.find(u => u.email === email);
        if (exists) {
            return res.status(409).json({ message: 'Conflict: Email already exists in the system.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ id: result.id, message: 'User created successfully' });
    } catch (error) {
        console.error('Add User Error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.update(id, req.body);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.delete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

export const getManagers = async (req, res) => {
    try {
        const managers = await User.getManagers();
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching managers', error: error.message });
    }
};

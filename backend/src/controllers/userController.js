const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [result] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email.toLowerCase(), hashedPassword, first_name || '', last_name || '']
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.insertId,
          email: email.toLowerCase(),
          first_name: first_name || '',
          last_name: last_name || ''
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    try {
      // Get user
      const [users] = await connection.query(
        'SELECT id, email, password, first_name, last_name FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT id, email, first_name, last_name, phone, date_of_birth, profile_picture_url, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId, first_name, last_name, phone, date_of_birth } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ? WHERE id = ?',
        [first_name, last_name, phone, date_of_birth, userId]
      );

      res.json({ message: 'Profile updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};

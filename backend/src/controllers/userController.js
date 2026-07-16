const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

const registerUser = async (req, res) => {
  try {
    console.log('📝 Register Request Received');
    const { email, password, first_name, last_name } = req.body;

    // Validation
    console.log('🔍 Validating input...');
    if (!email || !password) {
      console.warn('❌ Validation failed: Email or password missing');
      return res.status(400).json({ 
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (password.length < 6) {
      console.warn('❌ Validation failed: Password too short');
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    console.log(`✓ Validation passed for email: ${email}`);
    console.log('🔗 Getting database connection...');
    const connection = await pool.getConnection();

    try {
      // Check if user exists
      console.log(`🔎 Checking if user exists with email: ${email}`);
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (existing.length > 0) {
        console.warn(`⚠️  User already exists: ${email}`);
        return res.status(409).json({ 
          message: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }

      console.log('✓ User does not exist, proceeding with registration');
      
      // Hash password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✓ Password hashed successfully');

      // Create user
      console.log('💾 Inserting user into database...');
      const [result] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email.toLowerCase(), hashedPassword, first_name || '', last_name || '']
      );

      console.log(`✅ User registered successfully with ID: ${result.insertId}`);
      res.status(201).json({
        message: 'User registered successfully',
        code: 'REGISTRATION_SUCCESS',
        user: {
          id: result.insertId,
          email: email.toLowerCase(),
          first_name: first_name || '',
          last_name: last_name || ''
        }
      });
    } finally {
      console.log('🔌 Releasing database connection');
      connection.release();
    }
  } catch (error) {
    console.error('❌ Register error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    // Return detailed error to client
    res.status(500).json({ 
      message: 'Registration failed: ' + error.message,
      code: 'REGISTRATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('📝 Login Request Received');
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('❌ Validation failed: Email or password missing');
      return res.status(400).json({ 
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    console.log(`🔗 Getting database connection for email: ${email}`);
    const connection = await pool.getConnection();

    try {
      // Get user
      console.log(`🔎 Fetching user from database: ${email}`);
      const [users] = await connection.query(
        'SELECT id, email, password, first_name, last_name FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        console.warn(`⚠️  User not found: ${email}`);
        return res.status(401).json({ 
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const user = users[0];
      console.log(`✓ User found, verifying password...`);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.warn(`⚠️  Invalid password for user: ${email}`);
        return res.status(401).json({ 
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      console.log(`✅ Login successful for user: ${email}`);
      res.json({
        message: 'Login successful',
        code: 'LOGIN_SUCCESS',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
    } finally {
      console.log('🔌 Releasing database connection');
      connection.release();
    }
  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Login failed: ' + error.message,
      code: 'LOGIN_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log('📝 Get Profile Request Received');
    const { userId } = req.query;

    if (!userId) {
      console.warn('❌ Validation failed: User ID missing');
      return res.status(400).json({ 
        message: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    console.log(`🔗 Getting database connection for userId: ${userId}`);
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT id, email, first_name, last_name, phone, date_of_birth, profile_picture_url, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        console.warn(`⚠️  User not found with ID: ${userId}`);
        return res.status(404).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log(`✅ Profile retrieved for user: ${userId}`);
      res.json(users[0]);
    } finally {
      console.log('🔌 Releasing database connection');
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get profile error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Failed to retrieve profile: ' + error.message,
      code: 'PROFILE_FETCH_ERROR'
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    console.log('📝 Update Profile Request Received');
    const { userId, first_name, last_name, phone, date_of_birth } = req.body;

    if (!userId) {
      console.warn('❌ Validation failed: User ID missing');
      return res.status(400).json({ 
        message: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    console.log(`🔗 Getting database connection for userId: ${userId}`);
    const connection = await pool.getConnection();

    try {
      await connection.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ? WHERE id = ?',
        [first_name, last_name, phone, date_of_birth, userId]
      );

      console.log(`✅ Profile updated for user: ${userId}`);
      res.json({ 
        message: 'Profile updated successfully',
        code: 'PROFILE_UPDATE_SUCCESS'
      });
    } finally {
      console.log('🔌 Releasing database connection');
      connection.release();
    }
  } catch (error) {
    console.error('❌ Update profile error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Failed to update profile: ' + error.message,
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Database connection for Auth Service
const authDb = mysql.createPool({
  host: process.env.AUTH_DB_HOST || 'localhost',
  user: process.env.AUTH_DB_USER || 'root',
  password: process.env.AUTH_DB_PASSWORD || '',
  database: process.env.AUTH_DB_NAME || 'nyaaya_auth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database table
const initializeAuthDb = async () => {
  try {
    await authDb.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Auth database initialized');
  } catch (error) {
    console.error('Error initializing auth database:', error);
  }
};

initializeAuthDb();

// JWT token generation
const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

// Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await authDb.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await authDb.execute(
      'INSERT INTO users (email, hashed_password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const insertResult = result as mysql.ResultSetHeader;
    const userId = insertResult.insertId;

    // Generate JWT token
    const token = generateToken(userId, email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { userId, email }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user
    const [users] = await authDb.execute(
      'SELECT user_id, email, hashed_password FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.email);

    res.json({
      message: 'Login successful',
      token,
      user: { userId: user.user_id, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  // In a stateless JWT implementation, logout is handled client-side
  // by removing the token. This endpoint exists for completeness.
  res.json({ message: 'Logout successful' });
});

// GET /auth/verify
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verify user still exists in database
    const [users] = await authDb.execute(
      'SELECT user_id, email FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: { userId: decoded.userId, email: decoded.email }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

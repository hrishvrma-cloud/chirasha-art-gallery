const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'art-studio-secret-key-2026';

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Login (Admin or Parent)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// Parent Registration
router.post('/register-parent', (req, res) => {
  const { name, email, phone, password, childName, childAge } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const userId = 'parent-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, 'parent', ?)
  `).run(userId, name, email, phone || null, password_hash, now);

  // If child information is provided, create the child record linked to this parent
  let childId = null;
  if (childName && childName.trim()) {
    childId = 'stud-' + uuidv4().substring(0, 8);
    db.prepare(`
      INSERT INTO students (id, parent_id, name, age, grade, notes, status, joined_date)
      VALUES (?, ?, ?, ?, 'New Student', 'Registered via Parent Portal', 'active', ?)
    `).run(childId, userId, childName.trim(), parseInt(childAge) || 7, now.split('T')[0]);
  }

  const token = jwt.sign(
    { id: userId, email, name, role: 'parent' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: { id: userId, name, email, phone, role: 'parent' },
    childId
  });
});

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // If parent, also attach linked children
  let children = [];
  if (user.role === 'parent') {
    children = db.prepare('SELECT * FROM students WHERE parent_id = ?').all(user.id);
  }

  res.json({ user, children });
});

module.exports = { router, authMiddleware };

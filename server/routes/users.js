const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/users.json');

// ==================== HELPERS ====================

const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const signToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==================== MIDDLEWARE ====================

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, JWT_SECRET);
    
    const users = readDB();
    const user = users.find(u => u.id === payload.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// ==================== AUTH ROUTES ====================

// POST register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const users = readDB();
    const exists = users.find(u => u.email === email);
    
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: role || 'customer',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeDB(users);

    res.status(201).json({
      message: 'Registration successful',
      token: signToken(newUser),
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readDB();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      token: signToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== USER ROUTES ====================

// GET all users
router.get('/', (req, res) => {
  try {
    const users = readDB();
    // Don't return passwords
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single user by ID
router.get('/:id', (req, res) => {
  try {
    const users = readDB();
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET current user (requires auth)
router.get('/me', authenticate, (req, res) => {
  try {
    res.json(sanitizeUser(req.user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user
router.put('/:id', (req, res) => {
  try {
    const users = readDB();
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow password updates through this endpoint
    const { password, ...safeUpdates } = req.body;
    users[index] = { ...users[index], ...safeUpdates };
    writeDB(users);

    const { password: _, ...safeUser } = users[index];
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

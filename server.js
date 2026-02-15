// server.js (JSON “database” version, fixed + safer)
// Runs on port 3000 by default (or process.env.PORT)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== JSON FILE PATHS ====================

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// ==================== MIDDLEWARE ====================

app.use(helmet());

// CORS allow-list from .env (comma-separated). If not set, allow all (fine for local dev).
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: allowedOrigins || true,
  credentials: true
}));

// Basic rate limiting (especially helpful for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use(express.json());
app.use(express.static('public'));

// ==================== JSON “DATABASE” HELPERS ====================

async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function ensureUsersFile() {
  await ensureDataDirectory();
  try {
    await fs.access(USERS_FILE);
  } catch {
    // Create an empty array file if it doesn't exist
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
}

async function readUsers() {
  await ensureUsersFile();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find(u => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
}

async function findUserById(id) {
  const users = await readUsers();
  // IMPORTANT: normalize types (token may store "1" but file may store 1)
  return users.find(u => String(u.id) === String(id));
}

async function createUser(userData) {
  const users = await readUsers();

  const nextId = users.length > 0
    ? Math.max(...users.map(u => Number(u.id) || 0)) + 1
    : 1;

  const newUser = {
    id: nextId,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.role || 'customer',
    created_at: new Date().toISOString(),
    isActive: true,
    savedAddresses: []
  };

  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

async function updateUser(id, updates) {
  const users = await readUsers();
  const idx = users.findIndex(u => String(u.id) === String(id));
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  await writeUsers(users);
  return users[idx];
}

// ==================== SECURITY HELPERS ====================

const hashPassword = async (password) => bcrypt.hash(password, 12);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

// JWT_SECRET MUST exist (no insecure fallback)
const JWT_SECRET = (process.env.JWT_SECRET || '').trim();
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is missing. Add it to your .env file.');
  process.exit(1);
}

const signToken = (user) => {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await createUser({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: await hashPassword(String(password)),
      phone: phone ? String(phone).trim() : '',
      role: role ? String(role).trim() : 'customer',
      address: address ? String(address).trim() : ''
    });

  console.log("New user registered: " + user.email + " (" + user.role + ")");

    res.status(201).json({
      message: 'Account created successfully',
      token: signToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await comparePassword(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ error: 'Invalid credentials for ' + role + ' login' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    console.log('User logged in: ' + user.email + ' (' + user.role + ')');

    res.json({
      message: 'Login successful',
      token: signToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users/me', authenticate, (req, res) => {
  res.json(sanitizeUser(req.user));
});

app.put('/api/users/me', authenticate, async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const updates = {};
    if (name) updates.name = String(name).trim();
    if (phone) updates.phone = String(phone).trim();
    if (address) updates.address = String(address).trim();
    if (profileImage) updates.profileImage = String(profileImage).trim();

    const updated = await updateUser(req.user.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    console.log('User profile updated: ' + updated.email);

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updated)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/me/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await comparePassword(String(currentPassword), user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const updated = await updateUser(user.id, { password: await hashPassword(String(newPassword)) });
    console.log('Password changed for user: ' + updated.email);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deactivate (kept as POST like your version; you can make it PATCH if you want)
app.post('/api/users/me/deactivate', authenticate, async (req, res) => {
  try {
    const updated = await updateUser(req.user.id, { isActive: false });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    console.log('Account deactivated: ' + updated.email);

    res.json({
      message: 'Account deactivated successfully',
      user: { email: updated.email, isActive: updated.isActive }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Saved addresses
app.post('/api/users/me/addresses', authenticate, async (req, res) => {
  try {
    const { label, address, instructions } = req.body;

    if (!label || !address) {
      return res.status(400).json({ error: 'Label and address are required' });
    }

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const savedAddresses = Array.isArray(user.savedAddresses) ? user.savedAddresses : [];
    savedAddresses.push({
      label: String(label).trim(),
      address: String(address).trim(),
      instructions: instructions ? String(instructions).trim() : ''
    });

    const updated = await updateUser(user.id, { savedAddresses });

    console.log('Address added for user: ' + updated.email);
    res.json(updated.savedAddresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/me/addresses/:index', authenticate, async (req, res) => {
  try {
    const index = Number(req.params.index);
    const { label, address, instructions } = req.body;

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const savedAddresses = Array.isArray(user.savedAddresses) ? user.savedAddresses : [];
    if (!Number.isInteger(index) || index < 0 || index >= savedAddresses.length) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (label) savedAddresses[index].label = String(label).trim();
    if (address) savedAddresses[index].address = String(address).trim();
    if (instructions !== undefined) savedAddresses[index].instructions = String(instructions || '').trim();

    const updated = await updateUser(user.id, { savedAddresses });

    console.log('Address updated for user: ' + updated.email);
    res.json(updated.savedAddresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/me/addresses/:index', authenticate, async (req, res) => {
  try {
    const index = Number(req.params.index);

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const savedAddresses = Array.isArray(user.savedAddresses) ? user.savedAddresses : [];
    if (!Number.isInteger(index) || index < 0 || index >= savedAddresses.length) {
      return res.status(404).json({ error: 'Address not found' });
    }

    savedAddresses.splice(index, 1);

    const updated = await updateUser(user.id, { savedAddresses });

    console.log('Address deleted for user: ' + updated.email);
    res.json(updated.savedAddresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== SEED (FOR TESTING) ====================

app.post('/api/seed', async (req, res) => {
  try {
    const now = new Date().toISOString();

    const testUsers = [
      {
        id: 1,
        name: 'Test Customer',
        email: 'customer@test.com',
        password: await hashPassword('password123'),
        role: 'customer',
        phone: '555-0101',
        address: '123 Main St',
        created_at: now,
        isActive: true,
        savedAddresses: []
      },
      {
        id: 2,
        name: 'Test Restaurant',
        email: 'restaurant@test.com',
        password: await hashPassword('password123'),
        role: 'restaurant',
        phone: '555-0102',
        address: '456 Oak Ave',
        created_at: now,
        isActive: true,
        savedAddresses: []
      }
    ];

    await writeUsers(testUsers);
    console.log('Database seeded with test accounts');

    res.json({
      message: 'Database seeded successfully',
      userCount: testUsers.length,
      testAccounts: [
        { email: 'customer@test.com', password: 'password123', role: 'customer' },
        { email: 'restaurant@test.com', password: 'password123', role: 'restaurant' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
  try {
    const users = await readUsers();
    res.json({
      status: 'OK',
      database: 'JSON File',
      userCount: users.length,
      dataFile: USERS_FILE,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ status: 'ERROR', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Foodist API - Team DAAB!</h1><p>JSON Database Backend</p>');
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('Food Delivery Backend - Team DAAB! (JSON Database)');
  console.log('='.repeat(60));
  console.log('Server: http://localhost:' + PORT);
  console.log('Database: JSON files in ./data/');
  console.log('\nEndpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/users/me');
  console.log('  PUT  /api/users/me');
  console.log('  POST /api/users/me/change-password');
  console.log('  POST /api/users/me/deactivate');
  console.log('\nSeed: POST /api/seed');
  console.log('='.repeat(60) + '\n');
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/users.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all users
router.get('/', (req, res) => {
  const users = readDB();
  // Don't return passwords
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// GET single user by ID
router.get('/:id', (req, res) => {
  const users = readDB();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// POST login (fake auth - for Bridgette)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readDB();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const { password: _, ...safeUser } = user;
  res.json({ message: 'Login successful', user: safeUser });
});

// POST create new user (register)
router.post('/register', (req, res) => {
  const users = readDB();
  const exists = users.find(u => u.email === req.body.email);
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const newUser = { id: Date.now(), created_at: new Date().toISOString(), ...req.body };
  users.push(newUser);
  writeDB(users);
  const { password, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// PUT update user
router.put('/:id', (req, res) => {
  const users = readDB();
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  users[index] = { ...users[index], ...req.body };
  writeDB(users);
  const { password, ...safeUser } = users[index];
  res.json(safeUser);
});

module.exports = router;

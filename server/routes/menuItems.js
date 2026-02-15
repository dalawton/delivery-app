const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/menuItems.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all menu items
router.get('/', (req, res) => {
  const items = readDB();
  res.json(items);
});

// GET menu items by restaurant ID
router.get('/restaurant/:restaurantId', (req, res) => {
  const items = readDB();
  const filtered = items.filter(i => i.restaurant_id === parseInt(req.params.restaurantId));
  res.json(filtered);
});

// GET single menu item
router.get('/:id', (req, res) => {
  const items = readDB();
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json(item);
});

// POST create menu item
router.post('/', (req, res) => {
  const items = readDB();
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  writeDB(items);
  res.status(201).json(newItem);
});

// PUT update menu item
router.put('/:id', (req, res) => {
  const items = readDB();
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Menu item not found' });
  items[index] = { ...items[index], ...req.body };
  writeDB(items);
  res.json(items[index]);
});

// DELETE menu item
router.delete('/:id', (req, res) => {
  const items = readDB();
  const filtered = items.filter(i => i.id !== parseInt(req.params.id));
  writeDB(filtered);
  res.json({ message: 'Menu item deleted' });
});

module.exports = router;

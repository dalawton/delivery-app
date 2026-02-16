const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/menuItems.json');
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// GET all menu items for a specific restaurant
// Example: /api/menu-items/restaurant/1
router.get('/restaurant/:restaurantId', (req, res) => {
  const items = readDB();
  const filtered = items.filter(i => i.restaurant_id === parseInt(req.params.restaurantId));
  if (filtered.length === 0) return res.status(404).json({ message: 'No menu items found for this restaurant' });
  res.json(filtered);
});

// GET all menu items (search by name across all restaurants)
// Example: /api/menu-items?search=burger
router.get('/', (req, res) => {
  const items = readDB();
  const { search } = req.query;

  if (search) {
    const query = search.toLowerCase();
    const filtered = items.filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    );
    return res.json(filtered);
  }

  res.json(items);
});

module.exports = router;

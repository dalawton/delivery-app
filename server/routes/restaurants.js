const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/restaurants.json');
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// GET all restaurants, with optional search query
// Example: /api/restaurants?search=pizza
router.get('/', (req, res) => {
  const restaurants = readDB();
  const { search } = req.query;

  if (search) {
    const query = search.toLowerCase();
    const filtered = restaurants.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query)
    );
    return res.json(filtered);
  }

  res.json(restaurants);
});

// GET single restaurant by ID
router.get('/:id', (req, res) => {
  const restaurants = readDB();
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant);
});

module.exports = router;

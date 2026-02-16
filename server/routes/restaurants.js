const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/restaurants.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all restaurants
router.get('/', (req, res) => {
  const restaurants = readDB();
  res.json(restaurants);
});

// GET single restaurant by ID
router.get('/:id', (req, res) => {
  const restaurants = readDB();
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant);
});

// POST create new restaurant
router.post('/', (req, res) => {
  const restaurants = readDB();
  const newRestaurant = { id: Date.now(), ...req.body };
  restaurants.push(newRestaurant);
  writeDB(restaurants);
  res.status(201).json(newRestaurant);
});

// PUT update restaurant
router.put('/:id', (req, res) => {
  const restaurants = readDB();
  const index = restaurants.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Restaurant not found' });
  restaurants[index] = { ...restaurants[index], ...req.body };
  writeDB(restaurants);
  res.json(restaurants[index]);
});

// DELETE restaurant
router.delete('/:id', (req, res) => {
  const restaurants = readDB();
  const filtered = restaurants.filter(r => r.id !== parseInt(req.params.id));
  writeDB(filtered);
  res.json({ message: 'Restaurant deleted' });
});

module.exports = router;

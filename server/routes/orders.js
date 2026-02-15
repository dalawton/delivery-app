const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/orders.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all orders
router.get('/', (req, res) => {
  const orders = readDB();
  res.json(orders);
});

// GET orders by user ID
router.get('/user/:userId', (req, res) => {
  const orders = readDB();
  const userOrders = orders.filter(o => o.user_id === parseInt(req.params.userId));
  res.json(userOrders);
});

// GET single order
router.get('/:id', (req, res) => {
  const orders = readDB();
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// POST create new order (for Adi)
router.post('/', (req, res) => {
  const orders = readDB();
  const newOrder = {
    id: Date.now(),
    status: 'pending',
    created_at: new Date().toISOString(),
    ...req.body
  };
  orders.push(newOrder);
  writeDB(orders);
  res.status(201).json(newOrder);
});

// PUT update order status
router.put('/:id', (req, res) => {
  const orders = readDB();
  const index = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Order not found' });
  orders[index] = { ...orders[index], ...req.body };
  writeDB(orders);
  res.json(orders[index]);
});

module.exports = router;

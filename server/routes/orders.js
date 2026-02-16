const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/orders.json');
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all orders for a user
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

// POST create a new order (called when user hits "Proceed with Order")
// Body should include: user_id, restaurant_id, items[], delivery_address, phone, instructions, total_price
router.post('/', (req, res) => {
  const orders = readDB();
  const { user_id, restaurant_id, items, delivery_address, phone, instructions, total_price } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item' });
  }
  if (!delivery_address || !phone) {
    return res.status(400).json({ message: 'Delivery address and phone are required' });
  }

  const newOrder = {
    id: Date.now(),
    user_id: user_id || null,
    restaurant_id,
    items,              // [{ menu_item_id, name, quantity, price }]
    delivery_address,
    phone,
    instructions: instructions || '',
    total_price,
    status: 'pending', // pending → confirmed → delivered
    created_at: new Date().toISOString()
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

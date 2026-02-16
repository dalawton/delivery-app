const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../data/payments.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET all payments
router.get('/', (req, res) => {
  const payments = readDB();
  res.json(payments);
});

// GET payment by order ID (for Aramata)
router.get('/order/:orderId', (req, res) => {
  const payments = readDB();
  const payment = payments.find(p => p.order_id === parseInt(req.params.orderId));
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

// POST process a payment (for Aramata)
router.post('/', (req, res) => {
  const payments = readDB();
  const newPayment = {
    id: Date.now(),
    status: 'completed',
    created_at: new Date().toISOString(),
    ...req.body
  };
  payments.push(newPayment);
  writeDB(payments);
  res.status(201).json(newPayment);
});

// PUT update payment status
router.put('/:id', (req, res) => {
  const payments = readDB();
  const index = payments.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Payment not found' });
  payments[index] = { ...payments[index], ...req.body };
  writeDB(payments);
  res.json(payments[index]);
});

module.exports = router;

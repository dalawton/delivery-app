const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to the payments JSON file
const paymentsFilePath = path.join(__dirname, '../data/payments.json');

// ─── Helper: read payments from JSON file ─────────────────────────────────────
function readPayments() {
  const data = fs.readFileSync(paymentsFilePath, 'utf-8');
  return JSON.parse(data);
}

// ─── Helper: write payments back to JSON file ─────────────────────────────────
function writePayments(payments) {
  fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2));
}

// ─── Simulated Payment Processor ──────────────────────────────────────────────
// No real money involved — just simulates a 95% success rate for the demo.
function simulatePayment(paymentMethod) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.05;
      resolve({
        success,
        transactionId: success ? `TXN-${Date.now()}` : null,
        error: success ? null : 'Payment declined. Please try a different method.'
      });
    }, 800); // fake processing delay
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments
// Called after a customer selects a payment method and hits "Place Order".
// Expects: { order_id, amount, payment_method }
// payment_method must be: 'credit_card', 'paypal', or 'apple_pay'
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { order_id, amount, payment_method } = req.body;

  // ── 1. Validate required fields ───────────────────────────────────────────
  if (!order_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields: order_id, amount, payment_method.' });
  }

  // ── 2. Validate payment method ────────────────────────────────────────────
  const validMethods = ['credit_card', 'paypal', 'apple_pay'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method. Choose credit_card, paypal, or apple_pay.' });
  }

  // ── 3. Simulate the payment ───────────────────────────────────────────────
  const payment = await simulatePayment(payment_method);

  if (!payment.success) {
    return res.status(402).json({ error: payment.error });
  }

  // ── 4. Payment passed — save it to payments.json ──────────────────────────
  const payments = readPayments();

  // Generate a new ID (just increment from the last one)
  const newId = payments.length > 0 ? payments[payments.length - 1].id + 1 : 1;

  const newPayment = {
    id:             newId,
    order_id:       order_id,
    amount:         amount,
    status:         'completed',
    payment_method: payment_method,
    transaction_id: payment.transactionId,
    created_at:     new Date().toISOString()
  };

  payments.push(newPayment);
  writePayments(payments);

  // ── 5. Send back confirmation ─────────────────────────────────────────────
  return res.status(201).json({
    message:        'Payment successful!',
    payment_id:     newPayment.id,
    transaction_id: newPayment.transaction_id,
    status:         newPayment.status,
    amount:         newPayment.amount
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/order/:orderId
// Gets the payment details for a specific order.
// Called when a customer wants to see their payment confirmation.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/order/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const payments = readPayments();

  const payment = payments.find(p => p.order_id === orderId);

  if (!payment) {
    return res.status(404).json({ error: 'No payment found for this order.' });
  }

  return res.json(payment);
});

module.exports = router;

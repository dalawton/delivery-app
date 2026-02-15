const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// Simulated Payment Processor
// In a real app this would call Stripe, PayPal, etc.
// For now it just simulates a ~95% success rate so you can demo both outcomes.
// ─────────────────────────────────────────────────────────────────────────────
function simulatePayment(paymentMethod) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      resolve({
        success,
        transactionId: success ? `TXN-${Date.now()}` : null,
        error: success ? null : 'Payment declined. Please try a different method.'
      });
    }, 800); // fake processing delay
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Called when a customer hits "Place Order" in the checkout form.
// Expects: { customerName, customerEmail, customerPhone, deliveryAddress, items, total, paymentMethod }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    items,          // array of { itemId, name, price, quantity, restaurantName }
    total,
    paymentMethod   // 'credit_card', 'paypal', or 'apple_pay'
  } = req.body;

  // ── 1. Check all required fields are present ───────────────────────────────
  if (!customerName || !customerEmail || !deliveryAddress || !items?.length || !total) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  // ── 2. Validate payment method ─────────────────────────────────────────────
  const validMethods = ['credit_card', 'paypal', 'apple_pay'];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method. Choose credit_card, paypal, or apple_pay.' });
  }

  // ── 3. Simulate payment ────────────────────────────────────────────────────
  const payment = await simulatePayment(paymentMethod);

  if (!payment.success) {
    return res.status(402).json({ error: payment.error });
  }

  try {
    // ── 4. Payment passed — save the order to the database ───────────────────
    const orderResult = await pool.query(
      `INSERT INTO orders 
        (customer_name, customer_email, customer_phone, delivery_address, total, payment_method, payment_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [customerName, customerEmail, customerPhone, deliveryAddress, total, paymentMethod, 'paid', 'placed']
    );

    const order = orderResult.rows[0];

    // ── 5. Save each item in the order ────────────────────────────────────────
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items
          (order_id, item_name, price, quantity, restaurant_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.name, item.price, item.quantity, item.restaurantName]
      );
    }

    // ── 6. Send back confirmation ──────────────────────────────────────────────
    return res.status(201).json({
      _id:           order.id,
      status:        order.status,
      paymentStatus: order.payment_status,
      transactionId: payment.transactionId,
      total:         order.total,
      message:       'Order placed successfully!'
    });

  } catch (err) {
    console.error('Error placing order:', err.message);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

module.exports = router;

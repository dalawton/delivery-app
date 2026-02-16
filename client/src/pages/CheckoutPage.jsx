import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, restaurantId, clearCart } = useCart();

  const [form, setForm] = useState({
    delivery_address: '',
    phone: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.delivery_address.trim()) return setError('Please enter your delivery address.');
    if (!form.phone.trim()) return setError('Please enter your phone number.');

    setLoading(true);
    try {
      const orderPayload = {
        user_id: null, // Bridgette's auth will plug in the real user id later
        restaurant_id: restaurantId,
        items: cart.map(i => ({
          menu_item_id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        })),
        delivery_address: form.delivery_address,
        phone: form.phone,
        instructions: form.instructions,
        total_price: parseFloat((totalPrice + 2.99).toFixed(2))
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error('Failed to place order');
      const newOrder = await res.json();

      // Pass order to Aramata's payment page
      navigate('/payment', { state: { order: newOrder } });

    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyState}>
          <p>Your cart is empty. <span style={{ color: '#e85d04', cursor: 'pointer' }} onClick={() => navigate('/')}>Go back</span></p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/cart')}>← Back to Cart</button>
        <div style={styles.logo}>🍔 Foodist</div>
        <div />
      </header>

      <div style={styles.container}>
        <h1 style={styles.title}>Delivery Details</h1>

        <div style={styles.card}>
          {/* Address */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>📍 Delivery Address *</label>
            <input
              style={styles.input}
              type="text"
              name="delivery_address"
              placeholder="123 Main St, New York, NY"
              value={form.delivery_address}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>📞 Phone Number *</label>
            <input
              style={styles.input}
              type="tel"
              name="phone"
              placeholder="555-123-4567"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Driver Instructions */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>📝 Instructions for Driver (optional)</label>
            <textarea
              style={styles.textarea}
              name="instructions"
              placeholder="e.g. Leave at the door, Ring doorbell, Gate code: 1234..."
              value={form.instructions}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} style={styles.summaryRow}>
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ ...styles.summaryRow, borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '8px' }}>
            <span>Delivery Fee</span>
            <span>$2.99</span>
          </div>
          <div style={{ ...styles.summaryRow, fontWeight: '800', fontSize: '17px' }}>
            <span>Total</span>
            <span style={{ color: '#e85d04' }}>${(totalPrice + 2.99).toFixed(2)}</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Proceed to Payment →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh', backgroundColor: '#f9f9f9' },
  emptyState: { textAlign: 'center', marginTop: '100px', fontSize: '18px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  backBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#e85d04', fontWeight: '600' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#e85d04' },
  container: { maxWidth: '620px', margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px' },
  fieldGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '15px' },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #eee', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  textarea: { width: '100%', padding: '14px 16px', border: '2px solid #eee', borderRadius: '12px', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  summary: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px' },
  summaryTitle: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px', color: '#555' },
  error: { color: '#e63946', fontWeight: '600', marginBottom: '12px' },
  submitBtn: { width: '100%', backgroundColor: '#e85d04', color: '#fff', border: 'none', padding: '16px', borderRadius: '30px', cursor: 'pointer', fontWeight: '800', fontSize: '18px' },
};

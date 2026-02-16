import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, totalPrice, totalItems, restaurantId } = useCart();

  if (cart.length === 0) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
          <div style={styles.logo}>🍔 Foodist</div>
          <div />
        </header>
        <div style={styles.emptyState}>
          <p style={styles.emptyIcon}>🛒</p>
          <h2>Your cart is empty</h2>
          <p style={{ color: '#888' }}>Add items from a restaurant to get started</p>
          <button style={styles.browseBtn} onClick={() => navigate('/')}>Browse Restaurants</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.logo}>🍔 Foodist</div>
        <div />
      </header>

      <div style={styles.container}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Your Cart</h1>
          <button style={styles.clearBtn} onClick={clearCart}>🗑 Clear Cart</button>
        </div>

        {/* Cart Items */}
        <div style={styles.itemsList}>
          {cart.map(item => (
            <div key={item.id} style={styles.itemRow}>
              <img src={item.image_url} alt={item.name} style={styles.itemImg} />
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemPrice}>${item.price.toFixed(2)} each</p>
              </div>
              <div style={styles.qtyControl}>
                <button style={styles.qtyBtn} onClick={() => removeFromCart(item.id)}>−</button>
                <span style={styles.qtyNum}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => addToCart({ ...item })}>+</button>
              </div>
              <span style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Subtotal ({totalItems} items)</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Delivery Fee</span>
            <span>$2.99</span>
          </div>
          <div style={{ ...styles.summaryRow, fontWeight: '800', fontSize: '18px', borderTop: '2px solid #eee', paddingTop: '12px', marginTop: '8px' }}>
            <span>Total</span>
            <span style={{ color: '#e85d04' }}>${(totalPrice + 2.99).toFixed(2)}</span>
          </div>
          <button
            style={styles.proceedBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed with Order →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh', backgroundColor: '#f9f9f9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  backBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#e85d04', fontWeight: '600' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#e85d04' },
  emptyState: { textAlign: 'center', marginTop: '100px' },
  emptyIcon: { fontSize: '64px' },
  browseBtn: { marginTop: '16px', backgroundColor: '#e85d04', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '25px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '800' },
  clearBtn: { background: 'none', border: '2px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#888', fontWeight: '600' },
  itemsList: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
  itemImg: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px' },
  itemInfo: { flex: 1 },
  itemName: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' },
  itemPrice: { margin: 0, color: '#888', fontSize: '13px' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f5f5f5', borderRadius: '20px', padding: '6px 10px' },
  qtyBtn: { background: '#e85d04', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' },
  qtyNum: { fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  itemTotal: { fontWeight: '700', fontSize: '16px', minWidth: '60px', textAlign: 'right' },
  summary: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' },
  proceedBtn: { width: '100%', marginTop: '20px', backgroundColor: '#e85d04', color: '#fff', border: 'none', padding: '16px', borderRadius: '30px', cursor: 'pointer', fontWeight: '800', fontSize: '18px' },
};

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, totalItems, totalPrice } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [restRes, menuRes] = await Promise.all([
        fetch(`http://localhost:5000/api/restaurants/${id}`),
        fetch(`http://localhost:5000/api/menu-items/restaurant/${id}`)
      ]);
      const restData = await restRes.json();
      const menuData = await menuRes.json();
      setRestaurant(restData);
      setMenuItems(menuData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  const getItemQuantity = (itemId) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  // Group menu items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (!restaurant) return <p style={styles.loading}>Restaurant not found.</p>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <div style={styles.logo}>🍔 Foodist</div>
        <div style={styles.cartBtn} onClick={() => navigate('/cart')}>
          🛒 {totalItems > 0 ? `${totalItems} items · $${totalPrice.toFixed(2)}` : 'Cart'}
        </div>
      </header>

      {/* Restaurant Hero */}
      <div style={{ position: 'relative' }}>
        <img src={restaurant.image_url} alt={restaurant.name} style={styles.heroImg} />
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>{restaurant.name}</h1>
          <p style={styles.heroMeta}>
            {restaurant.cuisine} · ⭐ {restaurant.rating} · 🕐 {restaurant.delivery_time} · 🚚 ${restaurant.delivery_fee} delivery
          </p>
        </div>
      </div>

      {/* Menu */}
      <div style={styles.container}>
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{category}</h2>
            <div style={styles.menuGrid}>
              {items.map(item => {
                const qty = getItemQuantity(item.id);
                return (
                  <div key={item.id} style={styles.menuCard}>
                    <img src={item.image_url} alt={item.name} style={styles.menuImg} />
                    <div style={styles.menuBody}>
                      <h3 style={styles.menuName}>{item.name}</h3>
                      <p style={styles.menuDesc}>{item.description}</p>
                      <div style={styles.menuFooter}>
                        <span style={styles.menuPrice}>${item.price.toFixed(2)}</span>
                        {qty === 0 ? (
                          <button
                            style={styles.addBtn}
                            onClick={() => addToCart({ ...item })}
                          >
                            + Add
                          </button>
                        ) : (
                          <div style={styles.qtyControl}>
                            <button style={styles.qtyBtn} onClick={() => removeFromCart(item.id)}>−</button>
                            <span style={styles.qtyNum}>{qty}</span>
                            <button style={styles.qtyBtn} onClick={() => addToCart({ ...item })}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky bottom cart bar */}
      {totalItems > 0 && (
        <div style={styles.stickyBar}>
          <span>{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
          <button style={styles.stickyBtn} onClick={() => navigate('/cart')}>
            View Cart · ${totalPrice.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh', backgroundColor: '#f9f9f9', paddingBottom: '80px' },
  loading: { textAlign: 'center', marginTop: '80px', fontSize: '18px', color: '#888' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#e85d04', fontWeight: '600' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#e85d04' },
  cartBtn: { cursor: 'pointer', fontSize: '15px', fontWeight: '600', backgroundColor: '#e85d04', color: '#fff', padding: '10px 20px', borderRadius: '25px' },
  heroImg: { width: '100%', height: '260px', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '24px 32px' },
  heroTitle: { color: '#fff', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' },
  heroMeta: { color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' },
  categorySection: { marginBottom: '40px' },
  categoryTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '16px', color: '#333', borderBottom: '2px solid #e85d04', paddingBottom: '8px', display: 'inline-block' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  menuCard: { backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  menuImg: { width: '100%', height: '150px', objectFit: 'cover' },
  menuBody: { padding: '14px' },
  menuName: { margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700' },
  menuDesc: { margin: '0 0 14px 0', fontSize: '13px', color: '#777', lineHeight: '1.4' },
  menuFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  menuPrice: { fontWeight: '700', fontSize: '16px', color: '#e85d04' },
  addBtn: { backgroundColor: '#e85d04', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f5f5f5', borderRadius: '20px', padding: '4px 8px' },
  qtyBtn: { background: '#e85d04', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  stickyBar: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#e85d04', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: '600' },
  stickyBtn: { backgroundColor: '#fff', color: '#e85d04', border: 'none', padding: '10px 24px', borderRadius: '25px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' },
};

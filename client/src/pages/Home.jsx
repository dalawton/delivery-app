import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5000/api/restaurants?search=${query}`
        : 'http://localhost:5000/api/restaurants';
      const res = await fetch(url);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchRestaurants(val);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>🍔 Foodist</div>
        <div style={styles.cartBtn} onClick={() => navigate('/cart')}>
          🛒 Cart {totalItems > 0 && (
            <span style={styles.cartBadge}>{totalItems}</span>
          )}
          {totalItems > 0 && <span style={styles.cartTotal}> · ${totalPrice.toFixed(2)}</span>}
        </div>
      </header>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>What are you craving?</h1>
        <input
          style={styles.searchBar}
          type="text"
          placeholder="Search restaurants or cuisines..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Restaurants Grid */}
      <div style={styles.container}>
        {loading ? (
          <p style={styles.loading}>Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p style={styles.loading}>No restaurants found.</p>
        ) : (
          <div style={styles.grid}>
            {restaurants.map(r => (
              <div
                key={r.id}
                style={styles.card}
                onClick={() => navigate(`/restaurant/${r.id}`)}
              >
                <img src={r.image_url} alt={r.name} style={styles.cardImg} />
                <div style={styles.cardBody}>
                  <h3 style={styles.cardName}>{r.name}</h3>
                  <p style={styles.cardCuisine}>{r.cuisine}</p>
                  <div style={styles.cardMeta}>
                    <span>⭐ {r.rating}</span>
                    <span>🕐 {r.delivery_time}</span>
                    <span>🚚 ${r.delivery_fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh', backgroundColor: '#f9f9f9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '24px', fontWeight: '800', color: '#e85d04' },
  cartBtn: { cursor: 'pointer', fontSize: '16px', fontWeight: '600', backgroundColor: '#e85d04', color: '#fff', padding: '10px 20px', borderRadius: '25px', position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' },
  cartBadge: { backgroundColor: '#fff', color: '#e85d04', borderRadius: '50%', padding: '2px 7px', fontSize: '12px', fontWeight: '800' },
  cartTotal: { fontSize: '14px' },
  hero: { background: 'linear-gradient(135deg, #e85d04, #f48c06)', padding: '60px 32px', textAlign: 'center' },
  heroTitle: { color: '#fff', fontSize: '42px', fontWeight: '800', marginBottom: '24px', margin: '0 0 24px 0' },
  searchBar: { width: '100%', maxWidth: '540px', padding: '16px 24px', fontSize: '16px', borderRadius: '50px', border: 'none', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  loading: { textAlign: 'center', fontSize: '18px', color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
  cardBody: { padding: '16px' },
  cardName: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' },
  cardCuisine: { margin: '0 0 12px 0', color: '#888', fontSize: '14px' },
  cardMeta: { display: 'flex', gap: '12px', fontSize: '13px', color: '#555' },
};

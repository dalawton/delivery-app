const fs = require('fs');
const path = require('path');

const INDEX_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const APP_JS = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function loadApp({ currentUser = null, authToken = null, cart = null } = {}) {
  // Reset document
  document.documentElement.innerHTML = INDEX_HTML;

  // Ensure localStorage state before script evaluation (app.js reads localStorage at top-level)
  localStorage.clear();
  if (currentUser !== null) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  if (authToken !== null) localStorage.setItem('authToken', authToken);
  if (cart !== null) localStorage.setItem('cart', JSON.stringify(cart));

  // Provide a minimal global fetch mock so app.js network calls won't throw
  global.fetch = global.fetch || jest.fn().mockResolvedValue({ ok: true, json: async () => [] });

  // Wrap app.js in an IIFE so we can load it multiple times in the same test process
  const wrapped = `(function(){\n${APP_JS}\n// Export selected symbols for tests (including setter for restaurants)\nwindow.__app_exports = { getAuthHeaders, addToCart, updateQuantity, removeFromCart, renderRestaurants, loadRestaurants, __setRestaurants: (r) => { restaurants = r } };\n})();`;

  const scriptEl = document.createElement('script');
  scriptEl.textContent = wrapped;
  document.body.appendChild(scriptEl);

  // Trigger DOMContentLoaded to run initialization code in app.js
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

beforeEach(() => {
  jest.resetModules();
  // Mock window.alert and confirm to avoid blocking tests
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});

test('getAuthHeaders includes Authorization when token present', () => {
  loadApp({ authToken: 'TEST_TOKEN' });
  // getAuthHeaders should be defined globally
  expect(window.__app_exports).toBeDefined();
  const headers = window.__app_exports.getAuthHeaders();
  expect(headers['Content-Type']).toBe('application/json');
  expect(headers['Authorization']).toBe('Bearer TEST_TOKEN');
});

test('addToCart stores item and updates cart UI and totals', () => {
  loadApp({ currentUser: { id: 1, name: 'Tester', role: 'customer' }, authToken: null, cart: [] });

  // Ensure elements exist
  const badge = document.getElementById('cartBadge');
  const total = document.getElementById('cartTotal');
  expect(badge).not.toBeNull();
  expect(total).not.toBeNull();

  // Add item
  window.__app_exports.addToCart({ id: 'item1', name: 'Pizza', price: 9.5, restaurantId: 10, restaurantName: 'Pizzeria' });

  const stored = JSON.parse(localStorage.getItem('cart'));
  expect(stored).toHaveLength(1);
  expect(stored[0].quantity).toBe(1);

  // UI should reflect count and total
  expect(badge.textContent).toBe('1');
  expect(total.textContent).toBe('$9.50');
});

test('updateQuantity increments and decrements item quantity and removes when zero', () => {
  loadApp({ currentUser: { id: 1, name: 'Tester', role: 'customer' }, cart: [{ id: 'i1', name: 'Sushi', price: 5.0, restaurantName: 'SushiBar', restaurantId: 2, quantity: 1 }] });

  // Increase
  window.__app_exports.updateQuantity('i1', 1);
  let stored = JSON.parse(localStorage.getItem('cart'));
  expect(stored[0].quantity).toBe(2);

  // Decrease
  window.__app_exports.updateQuantity('i1', -1);
  stored = JSON.parse(localStorage.getItem('cart'));
  expect(stored[0].quantity).toBe(1);

  // Decrease to zero -> removed
  window.__app_exports.updateQuantity('i1', -1);
  stored = JSON.parse(localStorage.getItem('cart'));
  expect(stored).toHaveLength(0);
});

test('renderRestaurants displays provided restaurants', () => {
  loadApp({ cart: [] });

  // Provide restaurants and call render via exported setter
  window.__app_exports.__setRestaurants([
    { id: 11, name: 'Test Resto', rating: 4.2, address: '123 Main', menuItems: [{ id: 'm1', name: 'Burger', price: 4.5 }] }
  ]);

  window.__app_exports.renderRestaurants();
  const container = document.getElementById('restaurantsContainer');
  expect(container.innerHTML).toContain('Test Resto');
  expect(container.querySelectorAll('.restaurant-card').length).toBe(1);
});

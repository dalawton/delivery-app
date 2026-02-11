// Configuration
const API_URL = 'http://localhost:3000/api';

// SVG Icons Library
const icons = {
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  heartFilled: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  minus: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  store: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  truck: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>'
};

// Categories
const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Drinks', 'Mexican'];

// Application State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let restaurants = [];
let userOrders = [];
let activeCategory = 'All';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = new Set(JSON.parse(localStorage.getItem('favorites')) || []);
let searchQuery = '';
let activeTab = 'browse';

// DOM Elements
let authScreen, mainApp, authContent, authSubtitle;
let categoriesContainer, restaurantsContainer, orderHistoryContainer, favoritesContainer;
let cartBtn, cartBadge, cartOverlay, cartSidebar, closeCartBtn;
let cartItemsContainer, cartFooter, cartTotal, cartValidation;
let checkoutBtn, checkoutModal, checkoutForm, checkoutContent, cancelCheckout;
let searchInput, userName, userRole, logoutBtn, ordersBtn, profileBtn;

// Initialize DOM elements after page load
function initializeDOM() {
  authScreen = document.getElementById('authScreen');
  mainApp = document.getElementById('mainApp');
  authContent = document.getElementById('authContent');
  authSubtitle = document.getElementById('authSubtitle');
  
  categoriesContainer = document.getElementById('categoriesContainer');
  restaurantsContainer = document.getElementById('restaurantsContainer');
  orderHistoryContainer = document.getElementById('orderHistoryContainer');
  favoritesContainer = document.getElementById('favoritesContainer');
  
  cartBtn = document.getElementById('cartBtn');
  cartBadge = document.getElementById('cartBadge');
  cartOverlay = document.getElementById('cartOverlay');
  cartSidebar = document.getElementById('cartSidebar');
  closeCartBtn = document.getElementById('closeCartBtn');
  
  cartItemsContainer = document.getElementById('cartItemsContainer');
  cartFooter = document.getElementById('cartFooter');
  cartTotal = document.getElementById('cartTotal');
  cartValidation = document.getElementById('cartValidation');
  
  checkoutBtn = document.getElementById('checkoutBtn');
  checkoutModal = document.getElementById('checkoutModal');
  checkoutForm = document.getElementById('checkoutForm');
  checkoutContent = document.getElementById('checkoutContent');
  cancelCheckout = document.getElementById('cancelCheckout');
  
  searchInput = document.getElementById('searchInput');
  userName = document.getElementById('userName');
  userRole = document.getElementById('userRole');
  logoutBtn = document.getElementById('logoutBtn');
  ordersBtn = document.getElementById('ordersBtn');
  profileBtn = document.getElementById('profileBtn');
}

// ==================== AUTHENTICATION ====================

function handleRoleSelect(role) {
  console.log('Role selected:', role);
  renderRegistrationForm(role);
}

function showAuthScreen() {
  authScreen.style.display = 'flex';
  mainApp.classList.remove('active');
  renderInitialAuthScreen();
}

function showMainApp() {
  authScreen.style.display = 'none';
  mainApp.classList.add('active');
  updateUserDisplay();
  loadRestaurants();
}

function renderInitialAuthScreen() {
  authSubtitle.textContent = 'Welcome to Foodist';
  authContent.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <p style="font-size: 18px; color: #B8B9D1; margin-bottom: 48px; font-weight: 500; line-height: 1.6;">What would you like to do?</p>
      <div style="display: grid; gap: 16px; width: 100%;">
        <button id="signInBtn" class="auth-main-btn">Sign In / Register</button>
        <button id="guestBtn" class="auth-main-btn secondary">Browse as Guest</button>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const signInBtn = document.getElementById('signInBtn');
    const guestBtn = document.getElementById('guestBtn');
    
    if (signInBtn) {
      signInBtn.onclick = () => renderRoleSelection();
    }
    
    if (guestBtn) {
      guestBtn.onclick = () => {
        currentUser = { name: 'Guest', email: '', role: 'guest' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
      };
    }
  }, 0);
}

function renderRoleSelection() {
  authSubtitle.textContent = 'Select your role to continue';
  authContent.innerHTML = `
    <div style="display: grid; gap: 16px; margin-bottom: 24px;">
      <div class="role-card" onclick="handleRoleSelect('customer')">
        <div class="role-icon">${icons.user}</div>
        <div class="role-info">
          <h3>Customer</h3>
          <p>Order food from your favorite restaurants</p>
        </div>
      </div>
      <div class="role-card" onclick="handleRoleSelect('restaurant')">
        <div class="role-icon">${icons.store}</div>
        <div class="role-info">
          <h3>Restaurant</h3>
          <p>Manage your menu and orders</p>
        </div>
      </div>
    </div>
    <button class="auth-main-btn secondary" onclick="renderInitialAuthScreen()">Back</button>
  `;
}

function renderRegistrationForm(role) {
  authSubtitle.textContent = role === 'customer' ? 'Create Customer Account' : 'Create Restaurant Account';
  authContent.innerHTML = `
    <form id="registerForm" style="display: grid; gap: 16px;">
      <div class="form-group">
        <label for="regName">Full Name</label>
        <input type="text" id="regName" required>
      </div>
      <div class="form-group">
        <label for="regEmail">Email</label>
        <input type="email" id="regEmail" required>
      </div>
      <div class="form-group">
        <label for="regPhone">Phone</label>
        <input type="tel" id="regPhone" required>
      </div>
      <div class="form-group">
        <label for="regAddress">Address</label>
        <input type="text" id="regAddress" required>
      </div>
      <button type="submit" class="auth-main-btn">Create Account</button>
      <button type="button" class="auth-main-btn secondary" onclick="renderRoleSelection()">Back</button>
    </form>
  `;

  setTimeout(() => {
    const form = document.getElementById('registerForm');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const userData = {
          name: document.getElementById('regName').value,
          email: document.getElementById('regEmail').value,
          phone: document.getElementById('regPhone').value,
          address: document.getElementById('regAddress').value,
          role: role
        };

        try {
          const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          if (response.ok) {
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
          } else {
            alert('Registration failed. Please try again.');
          }
        } catch (error) {
          console.error('Registration error:', error);
          alert('Registration failed. Please check your connection and try again.');
        }
      };
    }
  }, 0);
}

function updateUserDisplay() {
  if (currentUser) {
    userName.textContent = currentUser.name;
    userRole.textContent = currentUser.role || 'Customer';
  }
}

function logout() {
  currentUser = null;
  cart = [];
  favorites = new Set();
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  localStorage.removeItem('favorites');
  showAuthScreen();
}

// ==================== API CALLS ====================

async function loadRestaurants() {
  try {
    let url = `${API_URL}/restaurants`;
    const params = new URLSearchParams();
    
    if (activeCategory !== 'All') {
      params.append('category', activeCategory);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('API returned non-array response:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      restaurants = [];
    } else {
      restaurants = data;
    }
    
    renderRestaurants();
    renderCategories();
  } catch (error) {
    console.error('Error loading restaurants:', error);
    restaurantsContainer.innerHTML = '<div class="error">Failed to load restaurants. Please check if the server is running.</div>';
  }
}

async function loadOrders() {
  if (!currentUser || !currentUser.email) {
    orderHistoryContainer.innerHTML = '<div class="empty-state"><p>Please log in to view your orders.</p></div>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders?email=${currentUser.email}`);
    const data = await response.json();
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('API returned non-array response:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      userOrders = [];
    } else {
      userOrders = data;
    }
    
    renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    orderHistoryContainer.innerHTML = '<div class="error">Failed to load orders.</div>';
  }
}

async function toggleFavoriteAPI(restaurantId) {
  if (!currentUser || !currentUser.email) return;
  
  try {
    await fetch(`${API_URL}/users/${currentUser.email}/favorites/${restaurantId}`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

// ==================== RENDERING ====================

function renderCategories() {
  categoriesContainer.innerHTML = categories.map(cat => `
    <button class="category-chip ${cat === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">
      ${cat}
    </button>
  `).join('');
}

function selectCategory(category) {
  activeCategory = category;
  loadRestaurants();
}

function renderRestaurants() {
  if (restaurants.length === 0) {
    restaurantsContainer.innerHTML = '<div class="empty-state"><p>No restaurants found.</p></div>';
    return;
  }

  restaurantsContainer.innerHTML = restaurants.map(restaurant => {
    const isFavorite = favorites.has(restaurant._id);
    return `
      <div class="restaurant-card">
        <div class="restaurant-image" style="background-image: url('${restaurant.image}')">
          ${restaurant.badge ? `<span class="badge">${restaurant.badge}</span>` : ''}
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${restaurant._id}')">
            ${isFavorite ? icons.heartFilled : icons.heart}
          </button>
        </div>
        <div class="restaurant-info">
          <div class="restaurant-header">
            <h3>${restaurant.name}</h3>
            <span class="category-tag">${restaurant.category}</span>
          </div>
          <div class="restaurant-meta">
            <span class="rating">${icons.star} ${restaurant.rating}</span>
            <span class="delivery-time">${icons.clock} ${restaurant.deliveryTime} min</span>
          </div>
          <div class="restaurant-items">
            ${restaurant.items.slice(0, 2).map(item => `
              <div class="menu-item">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-description">${item.description || ''}</div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="add-btn" onclick='addToCart(${JSON.stringify({
                  id: item._id,
                  name: item.name,
                  price: item.price,
                  restaurantName: restaurant.name
                })})'>
                  ${icons.plus}
                </button>
              </div>
            `).join('')}
            ${restaurant.items.length > 2 ? `<div class="view-more">+${restaurant.items.length - 2} more items</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderOrders() {
  if (userOrders.length === 0) {
    orderHistoryContainer.innerHTML = '<div class="empty-state"><p>No orders yet. Start ordering!</p></div>';
    return;
  }

  orderHistoryContainer.innerHTML = userOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">Order #${order._id.substring(0, 8)}</div>
          <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
        </div>
        <span class="order-status status-${order.status}">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-footer">
        <div class="order-total">Total: $${order.total.toFixed(2)}</div>
        <div class="order-actions">
          <button class="btn btn-secondary btn-sm" onclick="reorder('${order._id}')">Reorder</button>
          ${order.status === 'delivered' ? `<button class="btn btn-primary btn-sm" onclick="showReviewModal('${order._id}')">Review</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderFavorites() {
  const favoriteRestaurants = restaurants.filter(r => favorites.has(r._id));
  
  if (favoriteRestaurants.length === 0) {
    favoritesContainer.innerHTML = '<div class="empty-state"><p>No favorites yet. Add some!</p></div>';
    return;
  }

  favoritesContainer.innerHTML = favoriteRestaurants.map(restaurant => {
    return `
      <div class="restaurant-card">
        <div class="restaurant-image" style="background-image: url('${restaurant.image}')">
          ${restaurant.badge ? `<span class="badge">${restaurant.badge}</span>` : ''}
          <button class="favorite-btn active" onclick="toggleFavorite('${restaurant._id}')">
            ${icons.heartFilled}
          </button>
        </div>
        <div class="restaurant-info">
          <div class="restaurant-header">
            <h3>${restaurant.name}</h3>
            <span class="category-tag">${restaurant.category}</span>
          </div>
          <div class="restaurant-meta">
            <span class="rating">${icons.star} ${restaurant.rating}</span>
            <span class="delivery-time">${icons.clock} ${restaurant.deliveryTime} min</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== CART MANAGEMENT ====================

function addToCart(item) {
  const existingItem = cart.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateQuantity(itemId, change) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(itemId);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }
  }
}

function updateCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (itemCount > 0) {
    cartBadge.textContent = itemCount;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h3>Your cart is empty</h3>
        <p>Add some delicious items to get started!</p>
      </div>
    `;
    cartFooter.style.display = 'none';
  } else {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-restaurant">${item.restaurantName}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">${icons.minus}</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">${icons.plus}</button>
        </div>
      </div>
    `).join('');
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartFooter.style.display = 'block';
  }
}

function toggleCart(show) {
  if (show) {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
  } else {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

// ==================== CHECKOUT ====================

function showCheckoutModal() {
  if (!currentUser || currentUser.email === '') {
    alert('Please log in to place an order.');
    return;
  }
  
  toggleModal(true);
  
  // Pre-fill form with user data
  if (currentUser) {
    document.getElementById('customerName').value = currentUser.name || '';
    document.getElementById('customerEmail').value = currentUser.email || '';
    document.getElementById('customerPhone').value = currentUser.phone || '';
    document.getElementById('deliveryAddress').value = currentUser.address || '';
  }
}

async function handleCheckout(e) {
  e.preventDefault();
  
  const orderData = {
    customerName: document.getElementById('customerName').value,
    customerEmail: document.getElementById('customerEmail').value,
    customerPhone: document.getElementById('customerPhone').value,
    deliveryAddress: document.getElementById('deliveryAddress').value,
    items: cart.map(item => ({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      restaurantName: item.restaurantName
    })),
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const order = await response.json();
    
    // Show success message
    checkoutContent.innerHTML = `
      <div class="success-message">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3>Order Placed Successfully!</h3>
        <p>Order ID: #${order._id.substring(0, 8)}</p>
        <p>Your order is being prepared</p>
        <button class="btn btn-primary" onclick="viewOrder()">View Order</button>
      </div>
    `;

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to place order. Please try again.');
  }
}

function viewOrder() {
  toggleModal(false);
  toggleCart(false);
  switchTab('orders');
  
  // Reset checkout form
  setTimeout(() => {
    checkoutContent.innerHTML = `
      <h2>Checkout</h2>
      <form id="checkoutForm">
        <div class="form-group">
          <label for="customerName">Full Name</label>
          <input type="text" id="customerName" required>
        </div>
        <div class="form-group">
          <label for="customerEmail">Email</label>
          <input type="email" id="customerEmail" required>
        </div>
        <div class="form-group">
          <label for="customerPhone">Phone</label>
          <input type="tel" id="customerPhone" required>
        </div>
        <div class="form-group">
          <label for="deliveryAddress">Delivery Address</label>
          <input type="text" id="deliveryAddress" required>
        </div>
        <div class="modal-buttons">
          <button type="button" class="btn btn-secondary" id="cancelCheckout">Cancel</button>
          <button type="submit" class="btn btn-primary">Place Order</button>
        </div>
      </form>
    `;
    
    // Re-attach event listeners
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.getElementById('cancelCheckout').addEventListener('click', () => toggleModal(false));
  }, 500);
}

function toggleModal(show) {
  if (show) {
    checkoutModal.classList.add('active');
  } else {
    checkoutModal.classList.remove('active');
  }
}

// ==================== UTILITY FUNCTIONS ====================

function toggleFavorite(restaurantId) {
  if (favorites.has(restaurantId)) {
    favorites.delete(restaurantId);
  } else {
    favorites.add(restaurantId);
  }
  localStorage.setItem('favorites', JSON.stringify([...favorites]));
  toggleFavoriteAPI(restaurantId);
  renderRestaurants();
  if (activeTab === 'favorites') {
    renderFavorites();
  }
}

function reorder(orderId) {
  const order = userOrders.find(o => o._id === orderId);
  if (order) {
    cart = order.items.map(item => ({
      id: item.itemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      restaurantName: item.restaurantName
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    toggleCart(true);
    alert('Items added to cart!');
  }
}

function showReviewModal(orderId) {
  alert('Review feature coming soon!');
}

function switchTab(tab) {
  activeTab = tab;
  
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });
  
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  if (tab === 'browse') {
    document.getElementById('browseSection').classList.add('active');
  } else if (tab === 'orders') {
    document.getElementById('ordersSection').classList.add('active');
    loadOrders();
  } else if (tab === 'favorites') {
    document.getElementById('favoritesSection').classList.add('active');
    renderFavorites();
  }
}

// ==================== EVENT LISTENERS ====================

function attachEventListeners() {
  // Cart
  cartBtn.addEventListener('click', () => toggleCart(true));
  closeCartBtn.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));
  checkoutBtn.addEventListener('click', showCheckoutModal);
  
  // Checkout
  checkoutForm.addEventListener('submit', handleCheckout);
  cancelCheckout.addEventListener('click', () => toggleModal(false));
  
  // Search
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      loadRestaurants();
    }, 500);
  });
  
  // Navigation
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  ordersBtn.addEventListener('click', () => switchTab('orders'));
  
  profileBtn.addEventListener('click', () => {
    alert('Profile feature coming soon!');
  });
  
  logoutBtn.addEventListener('click', logout);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  initializeDOM();
  
  if (currentUser) {
    showMainApp();
  } else {
    showAuthScreen();
  }
  
  attachEventListeners();
  updateCart();
  console.log('App ready!');
});
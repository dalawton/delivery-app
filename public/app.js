const API_URL = 'http://localhost:5000/api';

// SVG Icons
const icons = {
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  store: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
};

// App State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let authToken = localStorage.getItem('authToken') || null;
let restaurants = [];
let currentRestaurant = null;
let userOrders = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let searchQuery = '';
let ownerRestaurants = [];
let ownerMenuItems = [];
let editingRestaurantId = null;
let editingMenuItemId = null;

// ==================== AUTH HELPERS ====================

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// DOM Elements
let authScreen, mainApp, authContent, authSubtitle;
let restaurantsContainer, orderHistoryContainer, menuItemsContainer;
let cartBtn, cartBadge, cartOverlay, cartSidebar, closeCartBtn;
let cartItemsContainer, cartFooter, cartTotal;
let checkoutBtn, checkoutModal, checkoutForm, cancelCheckout;
let searchInput, userName, userRole, logoutBtn, ordersBtn;
let backToRestaurantsBtn, restaurantDetailSection, browseSection, ordersSection;
let ownerDashboard, ownerRestaurantsList, ownerMenuItemsList, addRestaurantBtn, addMenuItemBtn;
let restaurantModal, restaurantForm, restaurantModalTitle;
let menuItemModal, menuItemForm, menuItemModalTitle;
let navTabs;

function initializeDOM() {
  authScreen = document.getElementById('authScreen');
  mainApp = document.getElementById('mainApp');
  authContent = document.getElementById('authContent');
  authSubtitle = document.getElementById('authSubtitle');
  
  restaurantsContainer = document.getElementById('restaurantsContainer');
  orderHistoryContainer = document.getElementById('orderHistoryContainer');
  menuItemsContainer = document.getElementById('menuItemsContainer');
  restaurantDetailSection = document.getElementById('restaurantDetailSection');
  
  cartBtn = document.getElementById('cartBtn');
  cartBadge = document.getElementById('cartBadge');
  cartOverlay = document.getElementById('cartOverlay');
  cartSidebar = document.getElementById('cartSidebar');
  closeCartBtn = document.getElementById('closeCartBtn');
  
  cartItemsContainer = document.getElementById('cartItemsContainer');
  cartFooter = document.getElementById('cartFooter');
  cartTotal = document.getElementById('cartTotal');
  
  checkoutBtn = document.getElementById('checkoutBtn');
  checkoutModal = document.getElementById('checkoutModal');
  checkoutForm = document.getElementById('checkoutForm');
  cancelCheckout = document.getElementById('cancelCheckout');
  
  searchInput = document.getElementById('searchInput');
  userName = document.getElementById('userName');
  userRole = document.getElementById('userRole');
  logoutBtn = document.getElementById('logoutBtn');
  ordersBtn = document.getElementById('ordersBtn');
  backToRestaurantsBtn = document.getElementById('backToRestaurants');
  
  browseSection = document.getElementById('browseSection');
  ordersSection = document.getElementById('ordersSection');
  
  // Owner dashboard elements
  ownerDashboard = document.getElementById('ownerDashboard');
  ownerRestaurantsList = document.getElementById('ownerRestaurantsList');
  ownerMenuItemsList = document.getElementById('ownerMenuItemsList');
  addRestaurantBtn = document.getElementById('addRestaurantBtn');
  addMenuItemBtn = document.getElementById('addMenuItemBtn');
  
  restaurantModal = document.getElementById('restaurantModal');
  restaurantForm = document.getElementById('restaurantForm');
  restaurantModalTitle = document.getElementById('restaurantModalTitle');
  
  menuItemModal = document.getElementById('menuItemModal');
  menuItemForm = document.getElementById('menuItemForm');
  menuItemModalTitle = document.getElementById('menuItemModalTitle');
  
  navTabs = document.getElementById('navTabs');
}

// ==================== AUTHENTICATION ====================

function showAuthScreen() {
  authScreen.style.display = 'flex';
  mainApp.classList.remove('active');
  renderInitialAuthScreen();
}

function showMainApp() {
  authScreen.style.display = 'none';
  mainApp.classList.add('active');
  updateUserDisplay();
  
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'restaurant_owner')) {
    // Show owner/admin dashboard
    browseSection.classList.remove('active');
    ordersSection.classList.remove('active');
    ownerDashboard.classList.add('active');
    navTabs.style.display = 'none';
    searchInput.parentElement.style.display = 'none';
    cartBtn.style.display = 'none';
    loadOwnerRestaurants();
    loadOwnerMenuItems();
    attachOwnerEventListeners();
  } else {
    // Show customer interface
    navTabs.style.display = 'flex';
    searchInput.parentElement.style.display = 'flex';
    cartBtn.style.display = 'block';
    ownerDashboard.classList.remove('active');
    loadRestaurants();
  }
}

function renderInitialAuthScreen() {
  authSubtitle.textContent = 'Welcome to Foodist';
  authContent.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <p style="font-size: 18px; color: #B8B9D1; margin-bottom: 48px; font-weight: 500;">What would you like to do?</p>
      <div style="display: grid; gap: 16px; width: 100%;">
        <button id="signInBtn" style="padding: 18px 24px; width: 100%; border: none; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; background: linear-gradient(135deg, rgb(255, 107, 53), rgb(108, 92, 231)); color: white; box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3); font-family: 'Outfit', sans-serif; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
          Sign In / Register
        </button>
        <button id="guestBtn" style="padding: 18px 24px; width: 100%; border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.05); color: white; font-family: 'Outfit', sans-serif; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
          Browse as Guest
        </button>
      </div>
    </div>
  `;
  
  const signInBtn = document.getElementById('signInBtn');
  const guestBtn = document.getElementById('guestBtn');
  
  if (signInBtn) {
    signInBtn.addEventListener('click', () => renderRoleSelection());
  }
  
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      currentUser = { name: 'Guest', email: '', role: 'guest' };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showMainApp();
    });
  }
}

function renderRoleSelection() {
  authSubtitle.textContent = 'Select your role';
  authContent.innerHTML = `
    <div class="role-selector">
      <div class="role-card" data-role="customer">
        <div class="role-icon">${icons.user}</div>
        <div class="role-info">
          <h3>Customer</h3>
          <p>Order food from restaurants</p>
        </div>
      </div>
      <div class="role-card" data-role="restaurant">
        <div class="role-icon">${icons.store}</div>
        <div class="role-info">
          <h3>Restaurant Owner</h3>
          <p>Manage your restaurant</p>
        </div>
      </div>
    </div>
    <div class="auth-buttons">
      <button class="btn btn-secondary" id="backBtn">Back</button>
      <button class="btn btn-primary" id="continueBtn" disabled>Continue</button>
    </div>
    <div class="auth-link">
      Already have an account? <a href="#" id="loginLink">Login</a>
    </div>
  `;
  
  let selectedRole = null;
  const roleCards = authContent.querySelectorAll('.role-card');
  const continueBtn = document.getElementById('continueBtn');
  const backBtn = document.getElementById('backBtn');
  const loginLink = document.getElementById('loginLink');
  
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role;
      continueBtn.disabled = false;
    });
  });
  
  continueBtn.addEventListener('click', () => {
    if (selectedRole) renderRegistrationForm(selectedRole);
  });
  
  backBtn.addEventListener('click', () => renderInitialAuthScreen());
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginForm();
  });
}

function renderRegistrationForm(role) {
  authSubtitle.textContent = `Create your ${role} account`;
  authContent.innerHTML = `
    <form id="registerForm">
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
        <label for="regPassword">Password</label>
        <input type="password" id="regPassword" required>
      </div>
      <div class="auth-buttons">
        <button type="button" class="btn btn-secondary" id="backBtn">Back</button>
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
    </form>
  `;
  
  const registerForm = document.getElementById('registerForm');
  const backBtn = document.getElementById('backBtn');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      phone: document.getElementById('regPhone').value,
      password: document.getElementById('regPassword').value,
      role: role
    };
    
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        // Ensure user has role field for display
        if (!user.role) user.role = 'customer';
        currentUser = user;
        if (data.token) {
          authToken = data.token;
          localStorage.setItem('authToken', authToken);
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration error: ' + error.message);
    }
  });
  
  backBtn.addEventListener('click', () => renderRoleSelection());
}

function renderLoginForm() {
  authSubtitle.textContent = 'Welcome back!';
  authContent.innerHTML = `
    <form id="loginForm">
      <div class="form-group">
        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" required>
      </div>
      <div class="form-group">
        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" required>
      </div>
      <div class="auth-buttons">
        <button type="button" class="btn btn-secondary" id="backBtn">Back</button>
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
    </form>
  `;
  
  const loginForm = document.getElementById('loginForm');
  const backBtn = document.getElementById('backBtn');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle server response format: { message, user: {...}, token: "..." }
        const user = data.user || data;
        // Ensure user has role field for display
        if (!user.role) user.role = 'customer';
        currentUser = user;
        if (data.token) {
          authToken = data.token;
          localStorage.setItem('authToken', authToken);
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + error.message);
    }
  });
  
  backBtn.addEventListener('click', () => renderInitialAuthScreen());
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    authToken = null;
    cart = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
    showAuthScreen();
  }
}

function updateUserDisplay() {
  if (currentUser) {
    userName.textContent = currentUser.name;
    const roleText = currentUser.role === 'guest' ? 'Guest' : (currentUser.role || 'Customer');
    userRole.textContent = roleText;
  }
}

// ==================== API FUNCTIONS ====================

async function fetchRestaurants() {
  try {
    let url = `${API_URL}/restaurants`;
    if (searchQuery) url += `?search=${searchQuery}`;
    
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
}

async function fetchOrders(userId) {
  try {
    const response = await fetch(`${API_URL}/orders/user/${userId}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async function fetchRestaurantDetail(restaurantId) {
  try {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching restaurant detail:', error);
    return null;
  }
}

async function fetchMenuItems(restaurantId) {
  try {
    const response = await fetch(`${API_URL}/menu-items/restaurant/${restaurantId}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

// ==================== RENDERING FUNCTIONS ====================

async function loadRestaurants() {
  restaurantsContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading delicious restaurants...</p>
    </div>
  `;
  
  restaurants = await fetchRestaurants();
  renderRestaurants();
}

function renderRestaurants() {
  if (restaurants.length === 0) {
    restaurantsContainer.innerHTML = `
      <div class="loading">
        <p>No restaurants found</p>
      </div>
    `;
    return;
  }
  
  restaurantsContainer.innerHTML = restaurants.map((restaurant) => `
    <div class="restaurant-card" data-restaurant-id="${restaurant.id}">
      <div class="restaurant-image">
        <img src="https://via.placeholder.com/400x200?text=${encodeURIComponent(restaurant.name)}" alt="${restaurant.name}">
      </div>
      <div class="restaurant-info">
        <h3 class="restaurant-name">${restaurant.name}</h3>
        <div class="restaurant-meta">
          <span>⭐ ${restaurant.rating || 4.5}</span>
          <span>📍 ${restaurant.address || 'Location'}</span>
        </div>
        <div class="menu-items">
          ${(restaurant.menuItems || []).slice(0, 3).map(item => `
            <div class="menu-item">
              <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.description || ''}</p>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span class="item-price">$${item.price}</span>
                <button class="add-btn" data-item='${JSON.stringify({id: item.id, name: item.name, price: item.price, restaurantId: restaurant.id, restaurantName: restaurant.name})}' onclick="event.stopPropagation();">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
  
  // Add click events to restaurant cards to navigate to detail view
  restaurantsContainer.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('click', () => {
      const restaurantId = card.dataset.restaurantId;
      showRestaurantDetail(restaurantId);
    });
  });
  
  restaurantsContainer.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = JSON.parse(btn.dataset.item);
      addToCart(item);
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '+'; }, 1000);
    });
  });
}

async function loadOrders() {
  if (!currentUser || currentUser.role === 'guest') {
    orderHistoryContainer.innerHTML = '<div class="loading"><p>Login to view orders</p></div>';
    return;
  }
  
  orderHistoryContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>
  `;
  
  userOrders = await fetchOrders(currentUser.id);
  renderOrders();
}

function renderOrders() {
  if (userOrders.length === 0) {
    orderHistoryContainer.innerHTML = '<div class="loading"><p>No orders yet</p></div>';
    return;
  }
  
  orderHistoryContainer.innerHTML = userOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Order #${String(order.id).slice(-8)}</span>
        <span class="order-status-badge">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">
        <span>Total</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

// ==================== RESTAURANT DETAIL ====================

async function showRestaurantDetail(restaurantId) {
  // Hide browse section and show detail section
  browseSection.classList.remove('active');
  ordersSection.classList.remove('active');
  restaurantDetailSection.classList.add('active');
  
  // Load restaurant detail
  menuItemsContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading menu...</p>
    </div>
  `;
  
  // Convert restaurantId to number (data attributes are strings)
  const restaurantIdNum = parseInt(restaurantId);
  const restaurant = restaurants.find(r => r.id === restaurantIdNum);
  if (!restaurant) {
    menuItemsContainer.innerHTML = '<p>Restaurant not found</p>';
    return;
  }
  
  currentRestaurant = restaurant;
  // Ensure currentRestaurant has an id field for order creation
  if (!currentRestaurant.id && currentRestaurant._id) {
    currentRestaurant.id = currentRestaurant._id;
  }
  
  // Update restaurant info
  document.getElementById('restaurantDetailTitle').textContent = restaurant.name;
  document.getElementById('restaurantDetailName').textContent = restaurant.name;
  document.getElementById('restaurantDetailAddress').textContent = `📍 ${restaurant.address || 'Address not available'}`;
  document.getElementById('restaurantDetailRating').textContent = `⭐ Rating: ${restaurant.rating || 4.5}`;
  document.getElementById('restaurantDetailImage').src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(restaurant.name)}`;
  
  // Fetch menu items
  let menuItems = restaurant.menuItems || [];
  if (!menuItems.length) {
    menuItems = await fetchMenuItems(restaurantIdNum);
  }
  
  renderMenuDetails(menuItems);
}

function renderMenuDetails(menuItems) {
  if (!menuItems || menuItems.length === 0) {
    menuItemsContainer.innerHTML = '<p>No menu items available</p>';
    return;
  }
  
  menuItemsContainer.innerHTML = menuItems.map(item => `
    <div class="menu-item-card">
      <h4>${item.name}</h4>
      <p>${item.description || 'A delicious item from our restaurant'}</p>
      <div class="menu-item-footer">
        <span class="menu-item-price">$${item.price.toFixed(2)}</span>
        <button class="menu-item-add" data-item='${JSON.stringify({
          id: item.id,
          name: item.name,
          price: item.price,
          restaurantId: currentRestaurant.id,
          restaurantName: currentRestaurant.name
        })}'>Add to Cart</button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to add to cart buttons
  menuItemsContainer.querySelectorAll('.menu-item-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = JSON.parse(btn.dataset.item);
      addToCart(item);
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
      }, 1500);
    });
  });
}

// ==================== CART FUNCTIONS ====================

function addToCart(item) {
  const existingItem = cart.find(cartItem => cartItem.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateQuantity(itemId, change) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== itemId);
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (itemCount > 0) {
    cartBadge.textContent = itemCount;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }
  
  cartTotal.textContent = '$' + total.toFixed(2);
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some delicious items to get started!</p>
      </div>
    `;
    cartFooter.style.display = 'none';
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p style="font-size: 12px; color: #B8B9D1;">${item.restaurantName}</p>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
            <span class="quantity">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="btn-remove" data-id="${item.id}" style="background: rgba(248, 113, 113, 0.2); color: #F87171; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-top: 8px; width: 100%;">Remove</button>
        </div>
      </div>
    `).join('');
    cartFooter.style.display = 'block';
    
    cartItemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });
    
    cartItemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });
    
    cartItemsContainer.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }
}

function toggleCart(show) {
  if (show) {
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
  } else {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
  }
}

// ==================== CHECKOUT ====================

function showCheckoutModal() {
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  
  if (currentUser.role === 'guest') {
    // Allow guests to checkout with their details
  }
  
  if (currentUser && currentUser.role !== 'guest') {
    document.getElementById('customerName').value = currentUser.name || '';
    document.getElementById('customerEmail').value = currentUser.email || '';
    document.getElementById('customerPhone').value = currentUser.phone || '';
  }
  
  checkoutModal.classList.add('active');
}

async function handleCheckout(e) {
  e.preventDefault();
  
  // For guest users, we still need to collect info but won't save to backend
  if (currentUser.role === 'guest') {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    
    alert('Order placed successfully! (Guest checkout)');
    cart = [];
    localStorage.removeItem('cart');
    updateCart();
    checkoutModal.classList.remove('active');
    toggleCart(false);
    return;
  }
  
  // For authenticated users, create the order
  const customerName = document.getElementById('customerName').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  
  // Get the first restaurant ID from cart items (should all be from same restaurant in ideal flow)
  const restaurantId = cart.length > 0 ? cart[0].restaurantId : null;
  
  if (!restaurantId) {
    alert('Error: No restaurant found for cart items');
    return;
  }
  
  const orderData = {
    user_id: currentUser.id,
    restaurant_id: restaurantId,
    items: cart.map(item => ({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    delivery_address: deliveryAddress,
    customer_name: customerName,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'placed'
  };
  
  try {
    await createOrder(orderData);
    alert('Order placed successfully!');
    cart = [];
    localStorage.removeItem('cart');
    updateCart();
    checkoutModal.classList.remove('active');
    toggleCart(false);
    if (currentUser && currentUser.role !== 'guest') {
      loadOrders();
    }
  } catch (error) {
    alert('Failed to place order: ' + error.message);
  }
}

function toggleModal(show) {
  if (show) {
    checkoutModal.classList.add('active');
  } else {
    checkoutModal.classList.remove('active');
  }
}

// ==================== EVENT LISTENERS ====================

function attachEventListeners() {
  logoutBtn.addEventListener('click', logout);
  cartBtn.addEventListener('click', () => toggleCart(true));
  closeCartBtn.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));
  checkoutBtn.addEventListener('click', showCheckoutModal);
  cancelCheckout.addEventListener('click', () => toggleModal(false));
  checkoutForm.addEventListener('submit', handleCheckout);
  
  // Back to restaurants button
  backToRestaurantsBtn.addEventListener('click', () => {
    restaurantDetailSection.classList.remove('active');
    browseSection.classList.add('active');
  });
  
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      
      tab.classList.add('active');
      if (tab.dataset.tab === 'browse') {
        browseSection.classList.add('active');
        restaurantDetailSection.classList.remove('active');
      } else if (tab.dataset.tab === 'orders') {
        ordersSection.classList.add('active');
        restaurantDetailSection.classList.remove('active');
        loadOrders();
      }
    });
  });
  
  // Search
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      loadRestaurants();
    }, 500);
  });
}

// ==================== RESTAURANT OWNER FUNCTIONS ====================

async function loadOwnerRestaurants() {
  try {
    const response = await fetch(`${API_URL}/restaurants`);
    if (response.ok) {
      const allRestaurants = await response.json();
      // If admin, show all restaurants. Otherwise, filter to only restaurants owned by the current user
      if (currentUser.role === 'admin') {
        ownerRestaurants = allRestaurants;
      } else {
        ownerRestaurants = allRestaurants.filter(r => r.owner_id === currentUser.id);
      }
      renderOwnerRestaurants();
    }
  } catch (error) {
    console.error('Error loading restaurants:', error);
  }
}

function renderOwnerRestaurants() {
  if (!ownerRestaurants.length) {
    ownerRestaurantsList.innerHTML = '<p style="text-align: center; color: #B8B9D1;">No restaurants yet. Create one to get started!</p>';
    return;
  }

  ownerRestaurantsList.innerHTML = ownerRestaurants.map(restaurant => `
    <div class="restaurant-item" style="padding: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 12px; background: rgba(255,255,255,0.02);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #FF6B35;">${restaurant.name}</h3>
          <p style="margin: 0; color: #B8B9D1; font-size: 14px;">${restaurant.cuisine} • ${restaurant.address}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="edit-btn" data-restaurant-id="${restaurant.id}" style="padding: 6px 12px; background: #6C5CE7; border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 12px;">Edit</button>
          <button class="delete-btn" data-type="restaurant" data-id="${restaurant.id}" style="padding: 6px 12px; background: #FF4757; border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 12px;">Delete</button>
        </div>
      </div>
    </div>
  `).join('');

  // Add event listeners
  ownerRestaurantsList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const restaurantId = btn.dataset.restaurantId;
      const restaurant = ownerRestaurants.find(r => r.id == restaurantId);
      if (restaurant) {
        editRestaurant(restaurant);
      }
    });
  });

  ownerRestaurantsList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this restaurant?')) {
        deleteRestaurant(parseInt(btn.dataset.id));
      }
    });
  });
}

async function loadOwnerMenuItems() {
  // If admin, show all menu items. Otherwise, filter by owned restaurants
  try {
    const response = await fetch(`${API_URL}/menu-items`);
    if (response.ok) {
      const allItems = await response.json();
      if (currentUser.role === 'admin') {
        ownerMenuItems = allItems;
      } else {
        // Get IDs of restaurants owned by this user
        const ownedRestaurantIds = ownerRestaurants.map(r => r.id);
        // Filter menu items to only those in owned restaurants
        ownerMenuItems = allItems.filter(item => ownedRestaurantIds.includes(item.restaurant_id));
      }
      renderOwnerMenuItems();
    }
  } catch (error) {
    console.error('Error loading menu items:', error);
  }
}

function renderOwnerMenuItems() {
  if (!ownerMenuItems.length) {
    ownerMenuItemsList.innerHTML = '<p style="text-align: center; color: #B8B9D1;">No menu items yet. Add one to get started!</p>';
    return;
  }

  ownerMenuItemsList.innerHTML = ownerMenuItems.map(item => `
    <div class="menu-item-row" style="padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="margin: 0 0 4px 0; color: #FF6B35;">${item.name}</h4>
        <p style="margin: 0; color: #B8B9D1; font-size: 13px;">$${item.price.toFixed(2)}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="edit-menu-btn" data-menu-id="${item.id}" style="padding: 6px 12px; background: #6C5CE7; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">Edit</button>
        <button class="delete-btn" data-type="menuitem" data-id="${item.id}" style="padding: 6px 12px; background: #FF4757; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">Delete</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  ownerMenuItemsList.querySelectorAll('.edit-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const menuId = btn.dataset.menuId;
      const item = ownerMenuItems.find(m => m.id == menuId);
      if (item) {
        editMenuItem(item);
      }
    });
  });

  ownerMenuItemsList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this menu item?')) {
        deleteMenuItem(parseInt(btn.dataset.id));
      }
    });
  });
}

function editRestaurant(restaurant) {
  editingRestaurantId = restaurant.id;
  restaurantModalTitle.textContent = 'Edit Restaurant';
  document.getElementById('restaurantName').value = restaurant.name;
  document.getElementById('restaurantCuisine').value = restaurant.cuisine;
  document.getElementById('restaurantAddress').value = restaurant.address;
  document.getElementById('restaurantRating').value = restaurant.rating;
  document.getElementById('restaurantDeliveryTime').value = restaurant.delivery_time;
  restaurantModal.classList.add('active');
}

function editMenuItem(item) {
  editingMenuItemId = item.id;
  menuItemModalTitle.textContent = 'Edit Menu Item';
  document.getElementById('menuItemName').value = item.name;
  document.getElementById('menuItemDescription').value = item.description || '';
  document.getElementById('menuItemPrice').value = item.price;
  document.getElementById('menuItemImageUrl').value = item.image_url || '';
  menuItemModal.classList.add('active');
}

function closeRestaurantModal() {
  restaurantModal.classList.remove('active');
  editingRestaurantId = null;
  restaurantForm.reset();
  restaurantModalTitle.textContent = 'Add Restaurant';
}

function closeMenuItemModal() {
  menuItemModal.classList.remove('active');
  editingMenuItemId = null;
  menuItemForm.reset();
  menuItemModalTitle.textContent = 'Add Menu Item';
}

async function saveRestaurant(e) {
  e.preventDefault();
  
  const restaurantData = {
    name: document.getElementById('restaurantName').value,
    cuisine: document.getElementById('restaurantCuisine').value,
    address: document.getElementById('restaurantAddress').value,
    rating: parseFloat(document.getElementById('restaurantRating').value),
    delivery_time: document.getElementById('restaurantDeliveryTime').value
  };

  // When creating a new restaurant, set the owner to the current user
  if (!editingRestaurantId) {
    restaurantData.owner_id = currentUser.id;
  }

  try {
    const method = editingRestaurantId ? 'PUT' : 'POST';
    const url = editingRestaurantId 
      ? `${API_URL}/restaurants/${editingRestaurantId}` 
      : `${API_URL}/restaurants`;

    const response = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(restaurantData)
    });

    if (response.ok) {
      alert(editingRestaurantId ? 'Restaurant updated!' : 'Restaurant created!');
      closeRestaurantModal();
      loadOwnerRestaurants();
      loadOwnerMenuItems();
    } else {
      alert('Error saving restaurant');
    }
  } catch (error) {
    console.error('Error saving restaurant:', error);
    alert('Error saving restaurant: ' + error.message);
  }
}

async function saveMenuItem(e) {
  e.preventDefault();
  
  if (!ownerRestaurants.length) {
    alert('Please create a restaurant first');
    return;
  }

  const menuItemData = {
    name: document.getElementById('menuItemName').value,
    description: document.getElementById('menuItemDescription').value,
    price: parseFloat(document.getElementById('menuItemPrice').value),
    image_url: document.getElementById('menuItemImageUrl').value,
    restaurant_id: ownerRestaurants[0].id // Use first restaurant for now
  };

  try {
    const method = editingMenuItemId ? 'PUT' : 'POST';
    const url = editingMenuItemId 
      ? `${API_URL}/menu-items/${editingMenuItemId}` 
      : `${API_URL}/menu-items`;

    const response = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(menuItemData)
    });

    if (response.ok) {
      alert(editingMenuItemId ? 'Menu item updated!' : 'Menu item created!');
      closeMenuItemModal();
      loadOwnerMenuItems();
    } else {
      alert('Error saving menu item');
    }
  } catch (error) {
    console.error('Error saving menu item:', error);
    alert('Error saving menu item: ' + error.message);
  }
}

async function deleteRestaurant(restaurantId) {
  // Verify ownership before deleting (unless admin)
  if (currentUser.role !== 'admin') {
    const restaurant = ownerRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      alert('You do not have permission to delete this restaurant');
      return;
    }
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      alert('Restaurant deleted!');
      loadOwnerRestaurants();
      loadOwnerMenuItems();
    } else {
      alert('Error deleting restaurant');
    }
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    alert('Error deleting restaurant: ' + error.message);
  }
}

async function deleteMenuItem(menuItemId) {
  // Verify ownership before deleting (unless admin)
  if (currentUser.role !== 'admin') {
    const menuItem = ownerMenuItems.find(m => m.id === menuItemId);
    if (!menuItem) {
      alert('You do not have permission to delete this menu item');
      return;
    }
  }

  try {
    const response = await fetch(`${API_URL}/menu-items/${menuItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      alert('Menu item deleted!');
      loadOwnerMenuItems();
    } else {
      alert('Error deleting menu item');
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    alert('Error deleting menu item: ' + error.message);
  }
}

function attachOwnerEventListeners() {
  addRestaurantBtn.addEventListener('click', () => {
    editingRestaurantId = null;
    restaurantForm.reset();
    restaurantModalTitle.textContent = 'Add Restaurant';
    restaurantModal.classList.add('active');
  });

  addMenuItemBtn.addEventListener('click', () => {
    editingMenuItemId = null;
    menuItemForm.reset();
    menuItemModalTitle.textContent = 'Add Menu Item';
    menuItemModal.classList.add('active');
  });

  restaurantForm.addEventListener('submit', saveRestaurant);
  menuItemForm.addEventListener('submit', saveMenuItem);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  initializeDOM();
  
  if (currentUser) {
    showMainApp();
  } else {
    showAuthScreen();
  }
  
  attachEventListeners();
  updateCart();
});

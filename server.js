const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fooddelivery';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  deliveryTime: String,
  image: String,
  badge: String,
  items: [itemSchema]
}, { timestamps: true });

const orderItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
  restaurantName: String
});

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  deliveryAddress: String,
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }]
}, { timestamps: true });

// Models
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// ==================== RESTAURANT ROUTES ====================

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single restaurant
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create restaurant (admin)
app.post('/api/restaurants', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update restaurant (admin)
app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete restaurant (admin)
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const { status, email } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (email) {
      query.customerEmail = email;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Create or get user
app.post('/api/users', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      user = new User(req.body);
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('favorites');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle favorite restaurant
app.post('/api/users/:email/favorites/:restaurantId', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const restaurantId = req.params.restaurantId;
    const index = user.favorites.indexOf(restaurantId);

    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(restaurantId);
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== STATS/ANALYTICS ROUTES ====================

// Get order statistics
app.get('/api/stats/orders', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEED DATA ROUTE (for testing) ====================

app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    
    // Seed restaurants
    const restaurants = [
      {
        name: "Bella Italia",
        category: "Pizza",
        rating: 4.8,
        deliveryTime: "25-35",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
        badge: "Popular",
        items: [
          { name: "Margherita Pizza", price: 12.99, description: "Fresh mozzarella, basil, tomato" },
          { name: "Pepperoni Pizza", price: 14.99, description: "Classic pepperoni, cheese" }
        ]
      },
      {
        name: "Burger House",
        category: "Burgers",
        rating: 4.6,
        deliveryTime: "20-30",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
        badge: "Fast",
        items: [
          { name: "Classic Burger", price: 9.99, description: "Beef patty, lettuce, tomato" },
          { name: "Cheese Burger", price: 10.99, description: "Double cheese, special sauce" }
        ]
      },
      {
        name: "Sushi Master",
        category: "Sushi",
        rating: 4.9,
        deliveryTime: "30-40",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
        badge: "Top Rated",
        items: [
          { name: "California Roll", price: 13.99, description: "Crab, avocado, cucumber" },
          { name: "Salmon Nigiri", price: 15.99, description: "Fresh salmon, sushi rice" }
        ]
      },
      {
        name: "Sweet Dreams",
        category: "Desserts",
        rating: 4.7,
        deliveryTime: "15-25",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
        badge: "New",
        items: [
          { name: "Chocolate Cake", price: 6.99, description: "Rich chocolate layers" },
          { name: "Tiramisu", price: 7.99, description: "Classic Italian dessert" }
        ]
      },
      {
        name: "Juice Bar",
        category: "Drinks",
        rating: 4.5,
        deliveryTime: "10-20",
        image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80",
        badge: "Healthy",
        items: [
          { name: "Green Smoothie", price: 5.99, description: "Spinach, banana, apple" },
          { name: "Berry Blast", price: 6.49, description: "Mixed berries, yogurt" }
        ]
      },
      {
        name: "Taco Fiesta",
        category: "Mexican",
        rating: 4.4,
        deliveryTime: "25-35",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
        badge: "Spicy",
        items: [
          { name: "Beef Tacos", price: 8.99, description: "Seasoned beef, fresh salsa" },
          { name: "Fish Tacos", price: 9.99, description: "Grilled fish, cabbage slaw" }
        ]
      }
    ];

    await Restaurant.insertMany(restaurants);
    
    res.json({ 
      message: 'Database seeded successfully',
      count: restaurants.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
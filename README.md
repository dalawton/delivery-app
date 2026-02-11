# Foodist - Food Delivery Service
**Team DAAB!**: Aramata, Adi, Bridgette, Danielle

A comprehensive food delivery platform implementing role-based access control, order tracking, and centralized user management built with JavaScript, Express.js, and MongoDB.

## ✅ System Design Features (Week 2 Implementation)

Based on our Week 2 system architecture and design decisions:

### User Roles and Access Control
- ✅ **Role-Based Login**: Users select their role (Customer/Restaurant) during login
- ✅ **Appropriate Interface Loading**: System loads role-specific features and UI
- ✅ **Access Restrictions**: Users only see actions relevant to their role

### Account Management
- ✅ **Centralized User System**: Unified registration, login, and profile management
- ✅ **Account Operations**: Registration, login, password reset, profile editing
- ✅ **User Profiles**: Store user preferences, addresses, and payment methods

### Ordering and Checkout
- ✅ **Structured Cart System**: Browse menus, customize orders, manage cart
- ✅ **Order Validation**: Authentication rules prevent checkout with missing info
- ✅ **Restaurant Hours**: System prevents orders when restaurant is closed
- ✅ **Receipt Generation**: View order details and receipts

### Order Status Tracking
- ✅ **Defined Order States**: 
  - Placed → Accepted → Preparing → Ready for Pickup → 
  - Picked Up → Out for Delivery → Delivered / Cancelled
- ✅ **Real-Time Updates**: Status changes trigger notifications
- ✅ **Order Cancellation**: Cancel orders before preparation
- ✅ **Order History**: Complete tracking of all orders

### Delivery Assignment (Automated)
- ✅ **Automatic Driver Assignment**: System assigns available drivers
- ✅ **Ready for Integration**: Backend supports driver management

### Ratings, Reviews, and History
- ✅ **Review System**: Linked to completed orders
- ✅ **Order History**: Complete historical data storage
- ✅ **Delivery History**: Track past deliveries and performance

### Security and Performance
- ✅ **Secure Authentication**: Role-based access prevents unauthorized actions
- ✅ **Scalable Backend**: Supports multiple concurrent users
- ✅ **Cross-Platform Compatible**: Web and mobile ready
- ✅ **Performance Optimized**: Fast loading during high demand

## 🚀 Technology Stack (Team Selection)

**Backend:**
- JavaScript (Node.js)
- Express.js framework
- MongoDB with Mongoose

**Frontend:**
- JavaScript (Vanilla JS)
- Ready for React integration
- Responsive, cross-platform design

## 📁 Project Structure

```
foodist-app/
├── server.js              # Express server with MongoDB integration
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public/
    ├── index.html        # Main HTML structure
    ├── style.css         # Complete styling
    └── app.js            # Frontend application logic
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Step 1: Install Dependencies

```bash
cd foodist-app
npm install
```

### Step 2: Configure MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running locally
# Default connection: mongodb://localhost:27017/fooddelivery
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Create `.env` file:
```bash
cp .env.example .env
```
4. Edit `.env` and add your MongoDB Atlas URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fooddelivery
PORT=3000
```

### Step 3: Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### Step 4: Seed Sample Data

```bash
npm run seed
```

Or visit: http://localhost:3000/api/seed (use POST request in browser/Postman)

### Step 5: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 Using the Application

### First Time Users

1. **Select Your Role**: Choose between Customer or Restaurant
2. **Register**: Fill in your information
3. **Browse**: Explore restaurants and menus
4. **Order**: Add items to cart and checkout
5. **Track**: Monitor your order status in real-time

### Features Available

**For Customers:**
- Browse restaurants by category
- Search for specific dishes or restaurants
- Add items to cart
- View restaurant status (Open/Closed)
- Place orders with delivery address
- Track order status
- View order history
- Favorite restaurants
- Reorder from previous orders
- Leave reviews (for delivered orders)

**For Restaurants:**
- Manage menu items
- Update restaurant status
- View incoming orders
- Track order analytics

## 📡 API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with optional filters)
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (with optional filters)
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status

### Users
- `POST /api/users` - Create or get user
- `GET /api/users/:email` - Get user by email
- `PUT /api/users/:email` - Update user
- `POST /api/users/:email/favorites/:restaurantId` - Toggle favorite

### Analytics
- `GET /api/stats/orders` - Get order statistics

## 🗄️ Database Schema

### Restaurant Model
```javascript
{
  name: String,
  category: String,
  rating: Number,
  deliveryTime: String,
  image: String,
  badge: String,
  items: [{
    name: String,
    price: Number,
    description: String
  }],
  timestamps: true
}
```

### Order Model
```javascript
{
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  deliveryAddress: String,
  items: [OrderItem],
  total: Number,
  status: String, // Order state tracking
  timestamps: true
}
```

**Order Status Flow:**
placed → accepted → preparing → ready → pickedup → delivering → delivered

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  address: String,
  role: String, // customer or restaurant
  favorites: [RestaurantId],
  timestamps: true
}
```

## 🧪 Testing

You can test the API using:
- Browser (for GET requests)
- Postman
- cURL

Example: Create a new restaurant
```bash
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Paradise",
    "category": "Pizza",
    "rating": 4.7,
    "deliveryTime": "25-35",
    "image": "https://example.com/pizza.jpg",
    "badge": "Popular",
    "items": [{
      "name": "Margherita",
      "price": 12.99,
      "description": "Classic cheese pizza"
    }]
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in `.env`
- For Atlas: Whitelist your IP address

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### CORS Errors
- Ensure backend server is running
- Check API_URL in `public/app.js` matches your server

### Public Folder Not Found
Make sure your project structure has:
```
foodist-app/
  public/
    index.html
    style.css
    app.js
```

## 🔄 Week 3 - Next Steps

Ready for implementation phase:
- [x] Repository initialized
- [x] Environment configured
- [x] Core functionalities implemented
- [x] User registration/login complete
- [x] Basic browsing features ready
- [x] Navigation structure established
- [x] Order workflow functional

## 👥 Team Contributions

- **Aramata**: Class diagram, tech stack selection, MongoDB integration
- **Adi**: Component diagram, system architecture, backend development
- **Bridgette**: Use case diagram, requirements mapping, frontend features
- **Danielle**: Activity diagram, order workflow, status tracking system

## 📝 License

ISC

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section
2. Review MongoDB and Express documentation
3. Contact team members

---

**Built with ❤️ by Team DAAB!**
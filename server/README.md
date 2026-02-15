# 🍔 Foodist - Backend Server

## Project Structure
```
server/
├── data/               ← JSON files (our fake database)
│   ├── users.json
│   ├── restaurants.json
│   ├── menuItems.json
│   ├── orders.json
│   └── payments.json
├── routes/             ← API endpoints
│   ├── users.js        ← Bridgette's routes (login/register/account)
│   ├── restaurants.js
│   ├── menuItems.js
│   ├── orders.js       ← Adi's routes (order service)
│   └── payments.js     ← Aramata's routes (payment/checkout)
├── index.js            ← Main server file
└── package.json
```

## Getting Started

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Run the server
```bash
npm run dev
```
Server runs at: `http://localhost:5000`

---

## API Endpoints (for frontend - Dani)

### Restaurants
- `GET /api/restaurants` — get all restaurants
- `GET /api/restaurants/:id` — get one restaurant

### Menu Items
- `GET /api/menu-items/restaurant/:restaurantId` — get menu for a restaurant

### Users (Bridgette)
- `POST /api/users/register` — register new user
- `POST /api/users/login` — login
- `GET /api/users/:id` — get user profile
- `PUT /api/users/:id` — update user info

### Orders (Adi)
- `GET /api/orders/user/:userId` — get all orders for a user
- `POST /api/orders` — create new order
- `PUT /api/orders/:id` — update order status

### Payments (Aramata)
- `POST /api/payments` — process a payment
- `GET /api/payments/order/:orderId` — get payment for an order

---

## How to add fake data
Just open the JSON files in `data/` and add entries directly. Follow the same format as existing entries.

## How the frontend connects
In your React app, call the API like this:
```javascript
const res = await fetch('http://localhost:5000/api/restaurants');
const data = await res.json();
```

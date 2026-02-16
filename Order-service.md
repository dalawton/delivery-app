# 🍔 Foodist - Order Service

## Structure
```
delivery-app/
├── client/                        ← React frontend (Dani + this service)
│   ├── src/
│   │   ├── context/
│   │   │   └── CartContext.jsx    ← global cart state
│   │   ├── pages/
│   │   │   ├── Home.jsx           ← restaurant list + search
│   │   │   ├── RestaurantPage.jsx ← menu + add/remove items
│   │   │   ├── CartPage.jsx       ← cart view + clear cart
│   │   │   └── CheckoutPage.jsx   ← address/phone/instructions → hands off to Aramata
│   │   ├── App.jsx                ← routing
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                        ← Express backend
    ├── data/
    │   ├── restaurants.json
    │   ├── menuItems.json
    │   └── orders.json
    ├── routes/
    │   ├── restaurants.js         ← GET /api/restaurants?search=
    │   ├── menuItems.js           ← GET /api/menu-items/restaurant/:id
    │   └── orders.js              ← POST /api/orders
    ├── index.js
    └── package.json
```

---

## How to Run

### Backend (Terminal 1)
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants?search=pizza` | Search restaurants |
| GET | `/api/restaurants/:id` | Get one restaurant |
| GET | `/api/menu-items/restaurant/:id` | Get menu for restaurant |
| GET | `/api/menu-items?search=burger` | Search menu items |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/user/:userId` | Get user's orders |

---

## User Flow (this service handles)
1. Home page → browse/search restaurants
2. Click restaurant → see menu
3. Add items to cart (+ / − buttons)
4. View cart → clear cart or proceed
5. Checkout → enter address, phone, driver instructions
6. Order saved to orders.json → **hands off to Aramata's /payment page**

## Handoff to Aramata (Payment)
When checkout is submitted, the app navigates to `/payment` and passes the order object via React Router state:
```js
navigate('/payment', { state: { order: newOrder } })
```
Aramata's PaymentPage can access it like:
```js
import { useLocation } from 'react-router-dom';
const { state } = useLocation();
const order = state.order; // has id, total_price, items, etc.
```

## Handoff from Bridgette (Auth)
The checkout currently sets `user_id: null`. Once Bridgette's login is working,
replace it with the logged-in user's ID from wherever she stores it (localStorage, context, etc.)

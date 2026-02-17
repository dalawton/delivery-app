# Foodist Delivery App - Setup Instructions

## Prerequisites
- Node.js and npm installed
- Windows/Mac/Linux terminal

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```bash
cp env.example .env  # or manually create it
```

Edit `server/.env`:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start the Backend Server
```bash
npm start      # Production mode
# or
npm run dev    # Development mode with auto-reload (requires nodemon)
```

The server will run on `http://localhost:5000`

## Frontend Setup

The frontend is already set up in the `public/` directory. Open `public/index.html` in your browser to access the app.

**Frontend API endpoint**: `http://localhost:5000/api`

## Authentication

The app uses JWT (JSON Web Token) authentication with bcrypt password hashing.

### Login/Register
1. Open the app at `public/index.html`
2. Click "Sign In / Register"
3. Choose your role (Customer or Restaurant Owner)
4. Register with email and password
5. Tokens are automatically stored in browser localStorage

### Test Credentials
After registration, use the same email/password to login.

### Testing with curl
```bash
# Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "555-1234",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use the returned token for authenticated requests
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure
```
├── public/                 # Frontend files
│   ├── index.html         # Main HTML
│   ├── app.js             # Main JavaScript with auth
│   └── style.css          # Styling
├── server/                 # Backend server
│   ├── index.js           # Express app setup
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables (not committed)
│   ├── data/              # JSON database files
│   │   ├── users.json
│   │   ├── restaurants.json
│   │   ├── menuItems.json
│   │   ├── orders.json
│   │   └── payments.json
│   └── routes/            # API route handlers
│       ├── users.js       # Authentication endpoints
│       ├── restaurants.js
│       ├── menuItems.js
│       ├── orders.js
│       └── payments.js
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user (returns JWT token)

### Users (Protected)
- `GET /api/users/me` - Get current user (requires Bearer token)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Other Endpoints
- `GET /api/restaurants` - Get all restaurants
- `GET /api/menu-items` - Get menu items
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders

## Troubleshooting

### Port 5000 already in use
Change the PORT in `server/.env` to a different port (e.g., 5001)

### JWT_SECRET error
Make sure `.env` file exists in the `server/` directory with JWT_SECRET set

### CORS errors
The server is configured to accept requests from all origins. If you need to restrict it, edit `server/index.js`

### Database file not found error
The JSON files in `server/data/` are automatically created on first run if they don't exist

## Security Notes
- **Never commit `.env` file** - It contains sensitive secrets
- Change `JWT_SECRET` in production to a strong random string
- Use HTTPS in production
- Consider implementing rate limiting via helmet/express-rate-limit
- Validate all user inputs before processing

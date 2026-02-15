# 🚀 Quick Start - Authentication Backend

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Start MongoDB
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (Mac)
brew services start mongodb-community
```

## Step 3: Set Up Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults are fine for local development)
```

## Step 4: Start Server
```bash
# Development mode (auto-restarts on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
```

## Step 5: Seed Test Data (Optional)
```bash
curl -X POST http://localhost:3000/api/seed
```

This creates:
- **Customer**: `customer@test.com` / `password123`
- **Restaurant**: `restaurant@test.com` / `password123`

## Test the API

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123","role":"customer"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'
```

### Get Profile
```bash
curl http://localhost:3000/api/users/me \
  -H "email: john@test.com"
```

Done! Your backend is connected to MongoDB and storing user accounts. 🎉

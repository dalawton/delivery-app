# 🔐 JSON Database Authentication Backend
**Team DAAB!** - No MongoDB Required!

## ✨ What Changed

**Before:** MongoDB database  
**Now:** JSON files (perfect for your project!)

All user data is stored in `./data/users.json`

## 📁 File Structure

```
server/
├── server.js          # Main backend code
├── package.json       # Dependencies
├── .env.example       # Config template
├── .env               # Your config (create this)
├── .gitignore         # Git ignore rules
├── data/
│   └── users.json     # User database (JSON file)
└── README.md          # This file
```

## 🚀 Setup (3 Steps)

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
JWT_SECRET=changethisrandomstring123
```

### 3. Start server
```bash
npm run dev
```

## 🌱 Seed Test Accounts

```bash
curl -X POST http://localhost:3000/api/seed
```

Creates:
- `customer@test.com` / `password123`
- `restaurant@test.com` / `password123`

## 📡 API Endpoints

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

Returns a `token` - save it!

### Get Profile (needs token)
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 💾 How JSON Database Works

When you register/login, data is saved to `./data/users.json`:

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "password": "$2a$12$hashed...",
    "phone": "555-1234",
    "address": "123 Main St",
    "role": "customer",
    "created_at": "2026-02-15T10:30:00Z",
    "isActive": true,
    "savedAddresses": []
  }
]
```

No MongoDB installation needed! 🎉

## 🔄 Git Integration

Push to GitHub:
```bash
git add .
git commit -m "Add JSON auth backend"
git push origin main
```

**Note:** `data/users.json` is in `.gitignore` - user data stays private!

## 📝 Frontend Integration Example

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@test.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
localStorage.setItem('authToken', token);

// Use token
const profile = await fetch('http://localhost:3000/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## ✅ Benefits of JSON Database

✅ No MongoDB installation  
✅ No database connection issues  
✅ Easy to see/edit data  
✅ Perfect for class projects  
✅ Works on any computer  
✅ Simple to understand  

## 🆘 Troubleshooting

**"Cannot find module"**
```bash
npm install
```

**"Port 3000 in use"**
- Change `PORT=3001` in `.env`

**"Authentication failed"**
- Include token: `Authorization: Bearer YOUR_TOKEN`

## 👥 Team DAAB!

Built with ❤️ for CIS 453

# Backend CORS Configuration Guide

## The Problem
Your frontend (http://localhost:3001) is being blocked by CORS when trying to access your backend (http://localhost:5000).

## The Solution

### For Express.js Backend:

1. Install cors package (if not already installed):
```bash
npm install cors
```

2. Add CORS middleware to your main server file (usually `app.js`, `server.js`, or `index.js`):

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration - ADD THIS BEFORE YOUR ROUTES
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3001'
  ],
  credentials: true, // IMPORTANT: Allows cookies and sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Your routes come after CORS
app.use('/api/auth', authRoutes);
// ... rest of your routes
```

### For Python/Flask Backend:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# CORS Configuration
CORS(app, 
     origins=[
         'http://localhost:3000',
         'http://localhost:3001',
         'http://localhost:3002'
     ],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
)
```

### For Python/FastAPI Backend:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing After Fix

1. Restart your backend server after adding CORS configuration
2. Go to http://localhost:3001/test-api
3. Click "Test API Connection"
4. Should see ✅ SUCCESS with status 401 (Not authenticated) - this is GOOD!
5. Try signup: http://localhost:3001/auth/signup

## Why CORS is Needed

Browsers block requests from one origin (localhost:3001) to another (localhost:5000) for security.
CORS headers tell the browser "it's okay, I trust this origin."

## Common Mistakes

❌ Adding CORS AFTER routes are defined (won't work)
❌ Not including `credentials: true` (sessions/cookies won't work)
❌ Not restarting backend after changes
❌ Using `origin: '*'` with credentials (not allowed by browsers)

✅ Add CORS middleware BEFORE routes
✅ Include credentials: true
✅ List specific origins
✅ Restart backend after changes

## Still Not Working?

1. Check browser console for exact error message
2. Check backend logs for incoming requests
3. Verify backend is running on correct port (5000)
4. Try disabling any browser extensions
5. Clear browser cache and cookies
6. Check if firewall is blocking requests

## Quick Test

Open browser console on http://localhost:3001/auth/signup and run:
```javascript
fetch('http://localhost:5000/api/auth/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log).catch(console.error)
```

If you see CORS error → Backend needs CORS fix
If you see 401/404 → Backend is reachable, just not authenticated/wrong path
If you see "Failed to fetch" → Backend not running or wrong port

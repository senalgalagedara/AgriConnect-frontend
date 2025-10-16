# Backend Endpoints Needed for Consumer Dashboard

## Required Endpoints

The consumer dashboard needs these endpoints to function properly:

### 1. GET /api/consumers/user/:userId
✅ **Status: Assumed to exist** - Consumer profile data

### 2. GET /api/orders/:userType/:userId
❌ **Status: Missing (404)** - User orders data

### 3. GET /api/feedback/user/:userType/:userId
❌ **Status: Missing (404)** - User feedback data

---

## 1. Orders Endpoint

### GET /api/orders/:userType/:userId

Fetch all orders for a specific user with their role.

**Route:**
```
GET /api/orders/:userType/:userId
```

**Authentication:** Session-based (credentials: 'include')

**Parameters:**
- `userType` (path parameter) - The role/type of user: 'consumer', 'driver', or 'farmer'
- `userId` (path parameter) - The ID of the user

**Example:**
```
GET /api/orders/consumer/2    # Consumer's orders
GET /api/orders/driver/10     # Driver's deliveries
GET /api/orders/farmer/15     # Farmer's orders
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-001",
      "user_id": 2,
      "date": "2025-10-15",
      "total": 2450.50,
      "amount": 2450.50,
      "status": "delivered",
      "items": ["Apple", "Banana"],
      "farm": "Green Valley Farm",
      "itemCount": 5,
      "created_at": "2025-10-15T10:30:00Z"
    }
  ]
}
```

### Backend Implementation (Node.js/Express)

```javascript
// routes/orders.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/orders/:userType/:userId
router.get('/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    // Validate userType
    const validTypes = ['consumer', 'driver', 'farmer', 'admin'];
    if (!validTypes.includes(userType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    // Query orders based on user type
    let query;
    if (userType === 'consumer') {
      query = 'SELECT * FROM orders WHERE consumer_id = $1 ORDER BY created_at DESC';
    } else if (userType === 'driver') {
      query = 'SELECT * FROM orders WHERE driver_id = $1 ORDER BY created_at DESC';
    } else if (userType === 'farmer') {
      query = 'SELECT * FROM orders WHERE farmer_id = $1 ORDER BY created_at DESC';
    }
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 2. Feedback Endpoint

### GET /api/feedback/user/:userType/:userId

Fetch all feedback submitted by a specific user with their role.

**Route:**
```
GET /api/feedback/user/:userType/:userId
```

**Authentication:** Session-based (credentials: 'include')

**Parameters:**
- `userType` (path parameter) - The role/type of user: 'consumer', 'driver', or 'farmer'
- `userId` (path parameter) - The ID of the user

**Example:**
```
GET /api/feedback/user/consumer/2
GET /api/feedback/user/driver/10
GET /api/feedback/user/farmer/15
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "user_type": "consumer",
      "subject": "Great Service",
      "message": "Very satisfied with the delivery",
      "rating": 5,
      "status": "pending",
      "priority": "medium",
      "feedback_type": "transactional",
      "created_at": "2025-10-16T10:30:00Z",
      "updated_at": "2025-10-16T10:30:00Z",
      "admin_notes": null,
      "meta": {
        "orderId": "ORD-123"
      }
    }
  ]
}
```

## Backend Implementation Example (Node.js/Express)

```javascript
// routes/feedback.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL connection

// GET /api/feedback/user/:userType/:userId
router.get('/user/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    // Validate userType
    const validTypes = ['consumer', 'driver', 'farmer', 'admin'];
    if (!validTypes.includes(userType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be: consumer, driver, farmer, or admin'
      });
    }
    
    // Query feedback table for this user
    const result = await pool.query(
      `SELECT 
        id, 
        user_id, 
        user_type, 
        subject, 
        message, 
        rating, 
        status, 
        priority, 
        attachments, 
        created_at, 
        updated_at, 
        resolved_at, 
        resolved_by, 
        admin_notes, 
        meta, 
        feedback_type
      FROM feedback 
      WHERE user_id = $1 AND user_type = $2
      ORDER BY created_at DESC`,
      [userId, userType]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

module.exports = router;
```

## How to Add to Your Backend

1. Create the route file: `routes/feedback.js`
2. Add the code above
3. Register the route in your main app file:

```javascript
// app.js or server.js
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);
```

4. Restart your backend server
5. Test the endpoint:
```bash
curl http://localhost:5000/api/feedback/user/consumer/2
```

## Frontend Implementation

The consumer dashboard now uses this format:

```javascript
const { id, role } = sessionData.user; // from session

// Fetch feedback with correct endpoint
const feedbackResponse = await fetch(
  `http://localhost:5000/api/feedback/user/${role}/${id}`,
  { credentials: 'include' }
);

// Example: GET /api/feedback/user/consumer/2
```

## Database Schema

The endpoint queries the `feedback` table:

```sql
SELECT * FROM feedback 
WHERE user_id = $1 AND user_type = $2
ORDER BY created_at DESC;
```

Columns:
- id, user_id, user_type, subject, message, rating
- status, priority, attachments, created_at, updated_at
- resolved_at, resolved_by, admin_notes, meta, feedback_type

## Testing

After creating the endpoint, test it:

```bash
# Get feedback for consumer with ID 2
curl -X GET http://localhost:5000/api/feedback/user/consumer/2 \
  -H "Cookie: your-session-cookie" \
  --include

# Get feedback for driver with ID 10
curl -X GET http://localhost:5000/api/feedback/user/driver/10 \
  -H "Cookie: your-session-cookie" \
  --include
```

Expected: 200 OK with array of feedback objects

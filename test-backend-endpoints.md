# Backend Endpoint Testing

## Issue
Getting 404 on: `GET http://localhost:5000/api/consumers/user/${userId}`
User claims they ARE a consumer in the database.

## Things to Check

### 1. Is the backend running?
Open: http://localhost:5000
Expected: Should see some response (even if just "Cannot GET /")

### 2. Check if the endpoint exists
The endpoint you mentioned should be:
```
GET /api/consumers/user/:userId
```

### 3. Test with curl or Postman
```bash
curl -X GET http://localhost:5000/api/consumers/user/2 \
  -H "Cookie: your-session-cookie" \
  --include
```

### 4. Expected Response Format
According to your earlier message:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "user@example.com",
    "role": "consumer",
    "first_name": "John",
    "last_name": "Doe",
    "contact_number": "1234567890",
    "address": "123 Main St",
    "status": "active"
  }
}
```

## Possible Solutions

### Option 1: Endpoint doesn't exist yet
You need to create this endpoint in your backend:

**Express.js example:**
```javascript
// In your backend routes file
router.get('/consumers/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query your database
    const user = await db.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2',
      [userId, 'consumer']
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consumer not found'
      });
    }
    
    res.json({
      success: true,
      data: user.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### Option 2: Use existing endpoint
If you have a different endpoint that works, use that instead.

For example, if you have:
- `GET /api/users/:id` - Use this for all users
- `GET /api/profile` - Use this with session auth

### Option 3: Check backend logs
Look at your backend console/logs when the request hits.
You should see the incoming request and any error messages.

## Frontend Fallback
The frontend now tries:
1. `/api/consumers/user/${userId}` first
2. `/api/users/${userId}` as fallback

Check the browser console for detailed logs!

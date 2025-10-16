# Feedback Edit and Delete Endpoints

## Overview
The consumer dashboard now has Edit and Delete buttons for feedback management. These require two additional backend endpoints.

## Required Endpoints

### 1. Update Feedback (PUT)
**Endpoint:** `PUT /api/feedback/:id`

**Description:** Update an existing feedback entry

**Request Headers:**
```
Content-Type: application/json
Credentials: include (for session)
```

**URL Parameters:**
- `id` (number) - The feedback ID to update

**Request Body:**
```json
{
  "rating": 5,
  "message": "Updated feedback message",
  "feedback_type": "user-experience",
  "updated_at": "2024-01-20T10:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "feedback": {
    "id": 1,
    "user_id": 21,
    "user_type": "consumer",
    "subject": "Updated Feedback",
    "message": "Updated feedback message",
    "rating": 5,
    "status": "pending",
    "feedback_type": "user-experience",
    "updated_at": "2024-01-20T10:30:00.000Z"
  }
}
```

**Express.js Implementation:**
```javascript
// PUT /api/feedback/:id
router.put('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, message, feedback_type, updated_at } = req.body;
    
    // Verify user owns this feedback (from session)
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if feedback exists and belongs to user
    const checkQuery = 'SELECT * FROM feedback WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found or unauthorized' });
    }
    
    // Update feedback
    const query = `
      UPDATE feedback 
      SET rating = $1, message = $2, feedback_type = $3, updated_at = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      rating, 
      message, 
      feedback_type, 
      updated_at || new Date().toISOString(), 
      id, 
      userId
    ]);
    
    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});
```

---

### 2. Delete Feedback (DELETE)
**Endpoint:** `DELETE /api/feedback/:id`

**Description:** Delete a feedback entry

**Request Headers:**
```
Credentials: include (for session)
```

**URL Parameters:**
- `id` (number) - The feedback ID to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback deleted successfully",
  "deletedId": 1
}
```

**Express.js Implementation:**
```javascript
// DELETE /api/feedback/:id
router.delete('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user owns this feedback (from session)
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if feedback exists and belongs to user
    const checkQuery = 'SELECT * FROM feedback WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found or unauthorized' });
    }
    
    // Delete feedback
    const query = 'DELETE FROM feedback WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [id, userId]);
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully',
      deletedId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});
```

---

## Frontend Implementation

### Edit Button
- Opens feedback modal with title "Edit Your Feedback"
- Displays current feedback subject in subtitle
- Note: Modal doesn't support pre-filling data yet, so users will need to re-enter their feedback
- Sends PUT request to `/api/feedback/:id` with new data
- Refreshes feedback list on success

### Delete Button
- Shows browser confirmation dialog: "Are you sure you want to delete this feedback? This action cannot be undone."
- If confirmed, sends DELETE request to `/api/feedback/:id`
- Refreshes feedback list on success
- Shows success/error alerts

### UI Features
- **Edit button:** Blue theme (`#dbeafe` background, `#1e40af` text) with Edit2 icon
- **Delete button:** Red theme (`#fee2e2` background, `#dc2626` text) with Trash2 icon
- Both buttons have hover effects and smooth transitions
- Located in feedback card header next to status badge

---

## Testing

### Test Edit Feedback:
```bash
curl -X PUT http://localhost:5000/api/feedback/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{
    "rating": 5,
    "message": "Updated feedback message",
    "feedback_type": "user-experience",
    "updated_at": "2024-01-20T10:30:00.000Z"
  }'
```

### Test Delete Feedback:
```bash
curl -X DELETE http://localhost:5000/api/feedback/1 \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

---

## Security Considerations

1. **Authorization:** Both endpoints verify that the user owns the feedback before allowing edit/delete
2. **Session Check:** Uses `req.session.userId` to identify the authenticated user
3. **SQL Injection Protection:** Uses parameterized queries ($1, $2, etc.)
4. **Confirmation:** Delete action requires user confirmation on frontend

---

## Related Files Modified
- `/src/app/dashboard/consumer/page.tsx` - Added edit/delete buttons and handlers
- Added imports: `Edit2, Trash2` from lucide-react
- New state: `editingFeedbackId` for tracking which feedback is being edited
- New functions: `handleEditFeedback()`, `handleDeleteFeedback()`

---

## Summary for Backend Developer

**Quick Copy-Paste Checklist:**

1. ✅ Add PUT `/api/feedback/:id` endpoint (update feedback)
2. ✅ Add DELETE `/api/feedback/:id` endpoint (delete feedback)
3. ✅ Verify user ownership before update/delete (check user_id matches session)
4. ✅ Return appropriate success/error responses
5. ✅ Test with the provided curl commands

**Database Table:** `feedback`
- Update fields: `rating`, `message`, `feedback_type`, `updated_at`
- Delete: Remove entire row where `id = :id AND user_id = :userId`

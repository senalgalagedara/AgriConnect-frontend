# 🚀 Frontend Migration Guide - Docker & API Updates

## ✅ Completed Setup

The following files have been created/updated:

### New Files Created:
1. ✅ `Dockerfile` - Docker container configuration for frontend
2. ✅ `.dockerignore` - Prevents unnecessary files in Docker image
3. ✅ `.env.local.example` - Environment variable template
4. ✅ `src/lib/api-client.ts` - Centralized API client with proper typing

### Updated Files:
1. ✅ `next.config.ts` - Added `output: 'standalone'` for Docker
2. ✅ `src/app/dashboard/consumer/page.tsx` - Already handles item objects correctly

---

## 📋 Migration Checklist

### Step 1: Environment Setup
- [x] Create `Dockerfile`
- [x] Create `.dockerignore`
- [x] Update `next.config.ts` with standalone output
- [ ] Copy `.env.local.example` to `.env.local` and configure

### Step 2: Install & Test Locally
```bash
# Install dependencies (if not already done)
npm install

# Test build
npm run build

# Test development
npm run dev
```

### Step 3: Docker Testing
```bash
# Make sure you're in the backend folder where docker-compose.yml is located
cd ../AgriConnect-backend

# Start all services (backend will handle frontend build)
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs if needed
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Step 4: Verify Services
- [ ] Frontend: http://localhost:3000
- [ ] Backend API: http://localhost:5000
- [ ] pgAdmin: http://localhost:5050
- [ ] Database: localhost:5432

---

## 🔧 API Client Usage

### Migrating from Direct Fetch to API Client

#### Before (Direct fetch):
```typescript
const response = await fetch(`http://localhost:5000/api/orders/consumer/${userId}`, {
  credentials: 'include'
});
const orders = await response.json();
```

#### After (Using API client):
```typescript
import { api, formatCurrency } from '@/lib/api-client';

const response = await api.orders.getUserOrders('consumer', userId);
const orders = response.data || response;

// Format prices easily
orders.forEach(order => {
  console.log(formatCurrency(order.total)); // "Rs. 31.95"
});
```

---

## 📊 Updated Data Structures

### Orders with Items (Now Available!)

```typescript
import { OrderWithItems, OrderItem } from '@/lib/api-client';

// Fetch orders
const ordersResponse = await api.orders.getUserOrders('consumer', userId);
const orders: OrderWithItems[] = ordersResponse.data || ordersResponse;

// Display order with items
orders.forEach(order => {
  console.log(`Order #${order.id}`);
  console.log(`Total: Rs. ${order.total.toFixed(2)}`);
  console.log(`Items (${order.item_count}):`);
  
  order.items.forEach(item => {
    const itemTotal = (item.qty * item.price).toFixed(2);
    console.log(`  - ${item.qty}x ${item.name} @ Rs. ${item.price.toFixed(2)} = Rs. ${itemTotal}`);
  });
});
```

### Consumer Dashboard (Already Updated!)

Your consumer dashboard at `src/app/dashboard/consumer/page.tsx` already handles:
- ✅ Numeric fields with `Number()` conversion
- ✅ Items as objects: `{ name, qty, price, product_id }`
- ✅ Fallback displays when data is missing
- ✅ Both `itemCount` and `item_count` field names

---

## 🔄 API Endpoint Changes

### 1. Consumer Profile - Now Works for All User Types

```typescript
// Still use the same endpoint
const profile = await api.consumer.getProfile(userId);

// But check user_type if needed
if (profile.data.user_type !== 'consumer') {
  // Redirect or show different UI
  router.push(`/dashboard/${profile.data.user_type}`);
}
```

### 2. Feedback - Returns All Feedback for User

```typescript
// userType parameter is ignored by backend, but kept for compatibility
const feedbackList = await api.feedback.getUserFeedback(userType, userId);

// Returns ALL feedback for this userId, regardless of user_type
```

### 3. Orders - Now Includes Items Array!

```typescript
const ordersResponse = await api.orders.getUserOrders('consumer', userId);
const orders = ordersResponse.data || ordersResponse;

// Each order now has:
orders[0].items // Array of { name, qty, price, product_id }
orders[0].item_count // Total number of items
orders[0].total // Number (not string!)
orders[0].tax // Number (not string!)
```

---

## 🐳 Docker Commands Reference

### Starting Services
```bash
# Windows
cd AgriConnect-backend
.\start-docker.bat

# Mac/Linux
cd AgriConnect-backend
./start-docker.sh

# Or manually
docker-compose up -d
```

### Checking Status
```bash
docker-compose ps
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stopping Services
```bash
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Rebuilding After Changes
```bash
# Rebuild frontend only
docker-compose up -d --build frontend

# Rebuild all services
docker-compose up -d --build
```

---

## 🎯 What's Already Done

Your consumer dashboard is already fully compatible with the new backend:

### ✅ Numeric Fields
```typescript
// Line 739 & 839 - Already using Number() conversion
Rs. {Number(order.total).toFixed(2)}
```

### ✅ Items Display
```typescript
// Lines 943-971 - Already handles objects
const itemDisplay = typeof item === 'string' 
  ? item 
  : `${item.qty}x ${item.name} - Rs. ${Number(item.price).toFixed(2)}`;
```

### ✅ Fallback Values
```typescript
// Already handles missing data
{order.farm || 'N/A'}
{order.itemCount || order.item_count || 0}
{order.date || new Date(order.created_at || '').toLocaleDateString()}
```

---

## 🧪 Testing Plan

### Priority 1: Docker Setup (HIGH)
1. [ ] Create `.env.local` from `.env.local.example`
2. [ ] Run `docker-compose up -d` from backend folder
3. [ ] Verify all 4 services are running
4. [ ] Access frontend at http://localhost:3000
5. [ ] Test login and navigation

### Priority 2: Orders Display (HIGH)
1. [ ] Login as a consumer
2. [ ] Navigate to dashboard
3. [ ] Verify orders show in "Overview" tab
4. [ ] Check that items list displays correctly
5. [ ] Verify prices show with 2 decimal places
6. [ ] Confirm item count is accurate

### Priority 3: Feedback (MEDIUM)
1. [ ] Check "Feedback" tab
2. [ ] Verify existing feedback displays
3. [ ] Test "Write Feedback" button
4. [ ] Test "Edit" button (if implemented)
5. [ ] Test "Delete" button (if implemented)

### Priority 4: Profile (MEDIUM)
1. [ ] Check "Profile" tab
2. [ ] Verify user data displays correctly
3. [ ] Test with different user types (if applicable)

---

## 🚨 Troubleshooting

### Frontend Not Building in Docker

**Issue:** Build fails with module errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild with no cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### API Calls Failing

**Issue:** 404 or connection errors

**Solution:**
1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variable: `NEXT_PUBLIC_API_URL` or `BACKEND_URL`
4. In Docker, use: `BACKEND_URL=http://backend:5000`

### Database Connection Issues

**Issue:** Backend can't connect to database

**Solution:**
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait for database to be ready
docker-compose up -d db
sleep 10
docker-compose up -d backend
```

### Port Already in Use

**Issue:** Port 3000 or 5000 already in use

**Solution:**
```bash
# Stop conflicting services
docker-compose down

# Or change ports in docker-compose.yml
# frontend: "3001:3000"
# backend: "5001:5000"
```

---

## 📝 Additional Notes

### Development vs Production

**Development (Local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

**Production (Docker):**
```env
NEXT_PUBLIC_API_URL=http://backend:5000
BACKEND_URL=http://backend:5000
```

### Hot Reload in Docker

The Docker setup supports hot reload in development mode. When you save a file:
- Frontend: Next.js will auto-refresh
- Backend: Nodemon will restart the server

### Data Persistence

- PostgreSQL data is stored in Docker volumes
- Data persists even when containers are stopped
- To clear data: `docker-compose down -v`

---

## 🎉 You're All Set!

Everything needed for Docker deployment and API integration has been set up. The consumer dashboard already works with the new backend response format.

### Next Steps:

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Start Docker services:**
   ```bash
   cd ../AgriConnect-backend
   docker-compose up -d
   ```

3. **Test the application:**
   - Open http://localhost:3000
   - Login and verify orders display correctly
   - Check that items show in order details

4. **Optional: Use API Client**
   - Gradually migrate to using `@/lib/api-client.ts`
   - Benefits: Type safety, error handling, helper functions

---

**Questions or Issues?**
- Check backend `DOCKER_SETUP.md` for detailed troubleshooting
- Review API responses using pgAdmin at http://localhost:5050
- Test endpoints directly with curl or Postman

**Happy Coding! 🚀**

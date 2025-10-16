# 🚀 Quick Start - Docker & API Updates

## ⚡ 5-Minute Setup

### 1. Copy Environment File (30 seconds)
```bash
cp .env.local.example .env.local
```

### 2. Start Docker Services (2 minutes)
```bash
cd ..\AgriConnect-backend
docker-compose up -d
```

### 3. Verify Services (30 seconds)
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                STATUS    PORTS
backend             Up        0.0.0.0:5000->5000/tcp
frontend            Up        0.0.0.0:3000->3000/tcp
postgres            Up        0.0.0.0:5432->5432/tcp
pgadmin             Up        0.0.0.0:5050->5050/tcp
```

### 4. Access Application (30 seconds)
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- pgAdmin: http://localhost:5050

---

## 🎯 What Changed?

### ✅ Your Code Already Works!

The consumer dashboard (`src/app/dashboard/consumer/page.tsx`) already handles:

1. **Numeric Fields** - Using `Number()` conversion
2. **Items as Objects** - Displays `{name, qty, price}`
3. **Missing Data** - Shows fallback messages

### 🆕 What's New?

1. **Docker Support** - Frontend now runs in containers
2. **Items Array** - Orders include full item details
3. **API Client** - Optional centralized API helper (`src/lib/api-client.ts`)

---

## 📊 Order Response Example

**Before:**
```json
{
  "id": 5,
  "total": "31.95",     // ❌ String
  "status": "processing"
  // ❌ No items
}
```

**Now:**
```json
{
  "id": 5,
  "total": 31.95,       // ✅ Number
  "status": "processing",
  "items": [            // ✅ NEW!
    {
      "name": "Apple",
      "qty": 2,
      "price": 5.00,
      "product_id": 1
    }
  ],
  "item_count": 1       // ✅ NEW!
}
```

---

## 🔧 Common Commands

### View Logs
```bash
# Frontend logs
docker-compose logs -f frontend

# Backend logs
docker-compose logs -f backend

# All logs
docker-compose logs -f
```

### Restart Service
```bash
# Restart frontend only
docker-compose restart frontend

# Restart all
docker-compose restart
```

### Stop Services
```bash
# Stop without removing
docker-compose stop

# Stop and remove containers
docker-compose down
```

### Rebuild After Code Changes
```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Rebuild all
docker-compose up -d --build
```

---

## 🧪 Quick Test Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Login works
- [ ] Dashboard displays
- [ ] Orders show with items
- [ ] Prices display correctly (Rs. XX.XX)
- [ ] Item counts are accurate

---

## 🚨 Quick Troubleshooting

### Port Already in Use
```bash
docker-compose down
# Wait 10 seconds
docker-compose up -d
```

### Frontend Build Failed
```bash
rm -rf .next
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Database Not Ready
```bash
docker-compose restart db
sleep 10
docker-compose restart backend
```

### Can't See Changes
```bash
# Frontend hot-reload should work automatically
# If not, restart:
docker-compose restart frontend
```

---

## 📚 Full Documentation

- **Complete Setup**: See `FRONTEND_MIGRATION_GUIDE.md`
- **Backend Details**: See backend's `DOCKER_SETUP.md`
- **API Reference**: See backend's `INTEGRATION_GUIDE.md`

---

## ✨ Pro Tips

1. **Use the API Client**: Import from `@/lib/api-client` for type safety
2. **Check Logs First**: Most issues visible in `docker-compose logs`
3. **pgAdmin Access**: Use http://localhost:5050 to inspect database
4. **Data Persists**: Volumes keep your data between restarts

---

**Need Help?** Check the full migration guide or backend documentation!

**Ready to Go?** Everything is set up! Just run `docker-compose up -d` 🎉

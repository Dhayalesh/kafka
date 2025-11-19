# Task Management System - Setup Guide

## Quick Fix for TimescaleDB Error

The error `"relation 'todo_event_logs' does not exist"` means TimescaleDB needs to be configured.

### **Option 1: Quick Setup (Recommended)**

1. **Make sure you have a `.env` file** in `todo_serer/` directory:
   ```bash
   cd todo_serer
   cp .env.example .env
   ```

2. **Configure TimescaleDB in `.env`**:
   ```env
   TIMESCALE_HOST=localhost
   TIMESCALE_PORT=5432
   TIMESCALE_DATABASE=todo_logs
   TIMESCALE_USER=postgres
   TIMESCALE_PASSWORD=your_password
   ```

3. **Restart your Node.js backend**:
   ```bash
   cd todo_serer
   npm start
   ```

The backend will now automatically create the TimescaleDB table on startup!

---

### **Option 2: Using Docker (if TimescaleDB not installed)**

If you don't have TimescaleDB installed, use Docker:

1. **Start TimescaleDB with Docker**:
   ```bash
   docker run -d --name timescaledb \
     -p 5432:5432 \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=todo_logs \
     timescale/timescaledb:latest-pg14
   ```

2. **Update your `.env`**:
   ```env
   TIMESCALE_HOST=localhost
   TIMESCALE_PORT=5432
   TIMESCALE_DATABASE=todo_logs
   TIMESCALE_USER=postgres
   TIMESCALE_PASSWORD=password
   ```

3. **Restart Node.js backend**:
   ```bash
   cd todo_serer
   npm start
   ```

---

### **Option 3: Run the Go Consumer (Alternative)**

The Go consumer also creates the TimescaleDB schema:

1. **Start the Go consumer**:
   ```bash
   cd go-consumer
   go run main.go
   ```

The Go consumer will create the table automatically when it starts.

---

## Full System Startup (Correct Order)

For the complete system, start services in this order:

### **1. Infrastructure Services**
```bash
# Start Kafka + Zookeeper + TimescaleDB
docker-compose up -d
```

### **2. Node.js Backend**
```bash
cd todo_serer
npm install
npm start
```

You should see:
```
✅ MongoDB connected
✅ TimescaleDB initialized
📝 Express: Publishing events to Kafka
Server running on port 3001
```

### **3. Go Consumer** (in another terminal)
```bash
cd go-consumer
go run main.go
```

You should see:
```
✅ Connected to TimescaleDB
🧩 TimescaleDB schema verified
🚀 Go Kafka Consumer started on topic: todo-history-events
```

### **4. React Frontend** (in another terminal)
```bash
cd todo
npm install
npm run dev
```

Access the app at: http://localhost:5173

---

## Verifying Everything Works

### **Check 1: API Health**
```bash
curl http://localhost:3001/api/health
```

Expected: `{"success":true,"message":"Todo Manager API is running"}`

### **Check 2: Get Tasks**
```bash
curl http://localhost:3001/api/tasks
```

Expected: `{"success":true,"data":[...]}`

### **Check 3: Get Logs**
```bash
curl http://localhost:3001/api/logs
```

Expected: `{"success":true,"data":[...]}` (no errors!)

---

## Environment Variables Reference

### **Backend (.env in todo_serer/)**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/todo_manager

# Kafka
KAFKA_ENABLED=true
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=todo-history-events

# TimescaleDB (REQUIRED for logs to work)
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5432
TIMESCALE_DATABASE=todo_logs
TIMESCALE_USER=postgres
TIMESCALE_PASSWORD=password

# AWS S3 (for snapshots)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket
```

### **Frontend (.env in todo/)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## Common Issues & Solutions

### ❌ "relation 'todo_event_logs' does not exist"
**Solution:**
- Check TimescaleDB is running
- Verify `.env` has correct TIMESCALE_* variables
- Restart the backend (it will create the table)

### ❌ "ECONNREFUSED" for TimescaleDB
**Solution:**
- Make sure TimescaleDB/PostgreSQL is running on port 5432
- Check Docker: `docker ps | grep timescale`
- Or check local PostgreSQL: `pg_isready`

### ❌ Kafka connection errors
**Solution:**
- Make sure Kafka is running: `docker ps | grep kafka`
- Check docker-compose.yml and start with: `docker-compose up -d`

### ❌ MongoDB connection errors
**Solution:**
- Update MONGODB_URI in .env
- For MongoDB Atlas: Add your IP to whitelist

---

## What's Changed

✅ **Fixed:**
- Removed duplicate API calls (removed React.StrictMode)
- Optimized task loading (no more individual API calls)
- Added TimescaleDB auto-initialization in backend
- Fixed environment variable naming

✅ **Now:**
- Only 1 API call to `/api/tasks` on load
- TimescaleDB table created automatically
- Logs endpoint works correctly
- Same functionality, better performance!

---

## Need Help?

If logs still don't work:
1. Check backend console for "✅ TimescaleDB initialized"
2. If you see errors, share the error message
3. Verify PostgreSQL/TimescaleDB is running: `psql -h localhost -U postgres -d todo_logs -c "SELECT 1"`

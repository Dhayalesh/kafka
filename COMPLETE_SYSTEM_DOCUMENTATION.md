# Complete Todo Application System Documentation

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Complete Architecture](#complete-architecture)
3. [Prerequisites & System Requirements](#prerequisites--system-requirements)
4. [Quick Start Guide](#quick-start-guide)
5. [Docker Infrastructure](#docker-infrastructure)
6. [Apache Kafka Operations](#apache-kafka-operations)
7. [Backend Server (Express.js)](#backend-server-expressjs)
8. [Frontend Application (React)](#frontend-application-react)
9. [Go Kafka Consumer](#go-kafka-consumer)
10. [Complete Data Flow](#complete-data-flow)
11. [Database Schemas](#database-schemas)
12. [API Reference](#api-reference)
13. [Event System](#event-system)
14. [Monitoring & Debugging](#monitoring--debugging)
15. [Troubleshooting Guide](#troubleshooting-guide)
16. [Production Deployment](#production-deployment)

---

## System Overview

### What is This System?

A **full-stack event-driven task management application** with real-time activity logging powered by Apache Kafka and TimescaleDB.

### Key Features

- ✅ **Task Management**: Create, update, and organize tasks in groups
- 📝 **Real-time Event Tracking**: All actions are logged via Kafka
- 📊 **Time-Series Analytics**: Historical data stored in TimescaleDB
- 🔄 **Event-Driven Architecture**: Microservices communicate via Kafka
- 🎨 **Modern UI**: React 19 with responsive design
- 🚀 **High Performance**: Go service for event processing

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React + Vite | 19.1.1 | User interface |
| **Backend** | Express.js | 5.1.0 | REST API server |
| **Event Stream** | Apache Kafka | 7.6.1 | Message broker |
| **Consumer** | Go | 1.22 | Event processor |
| **Operational DB** | MongoDB Atlas | 6.20.0 | Main data store |
| **Logs DB** | TimescaleDB | Latest | Event logs |
| **Container** | Docker Compose | - | Infrastructure |

---

## Complete Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLETE SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────┘

                           USER INTERACTION
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │    React Frontend        │
                    │    http://localhost:5173 │
                    │                          │
                    │  - UI Components         │
                    │  - State Management      │
                    │  - API Client            │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTP REST API
                                 │
                    ┌────────────▼─────────────┐
                    │  Express.js Backend      │
                    │  http://localhost:3001   │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  REST API Routes   │  │
                    │  │  - /api/auth       │  │
                    │  │  - /api/groups     │  │
                    │  │  - /api/tasks      │  │
                    │  │  - /api/logs       │  │
                    │  └─────────┬──────────┘  │
                    │            │             │
                    │  ┌─────────▼──────────┐  │
                    │  │  MongoDB Atlas     │  │
                    │  │  (Main Database)   │  │
                    │  │  - Users           │  │
                    │  │  - Groups          │  │
                    │  │  - Tasks           │  │
                    │  │  - Comments        │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Kafka Producer    │  │
                    │  │  (Publishes Events)│  │
                    │  └─────────┬──────────┘  │
                    └────────────┼─────────────┘
                                 │
                                 │ Event Messages
                                 │
                    ┌────────────▼─────────────┐
                    │  Docker Infrastructure   │
                    │  ┌────────────────────┐  │
                    │  │  Zookeeper         │  │
                    │  │  :2181             │  │
                    │  └─────────┬──────────┘  │
                    │            │             │
                    │  ┌─────────▼──────────┐  │
                    │  │  Apache Kafka      │  │
                    │  │  :9092 (external)  │  │
                    │  │  :29092 (internal) │  │
                    │  │                    │  │
                    │  │  Topic:            │  │
                    │  │  todo-history-     │  │
                    │  │  events            │  │
                    │  └─────────┬──────────┘  │
                    │            │             │
                    │  ┌─────────▼──────────┐  │
                    │  │  TimescaleDB       │  │
                    │  │  :5432             │  │
                    │  │  DB: todo_history  │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Adminer UI        │  │
                    │  │  :8080             │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Kafdrop UI        │  │
                    │  │  :9000             │  │
                    │  └────────────────────┘  │
                    └────────────┬─────────────┘
                                 │
                                 │ Consume Events
                                 │
                    ┌────────────▼─────────────┐
                    │  Go Kafka Consumer       │
                    │  (Standalone Service)    │
                    │                          │
                    │  - Reads from Kafka      │
                    │  - Processes Events      │
                    │  - Writes to TimescaleDB │
                    └──────────────────────────┘
```

### Port Allocation

| Service | Port(s) | Protocol | Access |
|---------|---------|----------|--------|
| **Frontend** | 5173 | HTTP | http://localhost:5173 |
| **Backend** | 3001 | HTTP | http://localhost:3001/api |
| **Zookeeper** | 2181 | TCP | Internal only |
| **Kafka External** | 9092 | TCP | localhost:9092 |
| **Kafka Internal** | 29092 | TCP | Docker network |
| **TimescaleDB** | 5432 | PostgreSQL | localhost:5432 |
| **Adminer** | 8080 | HTTP | http://localhost:8080 |
| **Kafdrop** | 9000 | HTTP | http://localhost:9000 |
| **MongoDB Atlas** | 27017 | MongoDB | Cloud (SRV) |

### Data Flow Sequence

```
1. User Action (Frontend)
   ↓
2. API Request (Express.js)
   ↓
3. Database Write (MongoDB)
   ↓
4. HTTP Response (to Frontend)
   ↓
5. Event Publish (Kafka Producer)
   ↓
6. Kafka Topic (todo-history-events)
   ↓
7. Event Consume (Go Consumer)
   ↓
8. Log Insert (TimescaleDB)
   ↓
9. Log Query (Express.js API)
   ↓
10. Display Logs (Frontend)
```

---

## Prerequisites & System Requirements

### Software Requirements

#### Required Software

1. **Node.js**
   - Version: 16.x or higher (18.x recommended)
   - Download: https://nodejs.org/
   - Used for: Frontend & Backend

2. **Docker Desktop**
   - Version: Latest stable
   - Download: https://www.docker.com/products/docker-desktop
   - Used for: Kafka, Zookeeper, TimescaleDB, Adminer, Kafdrop

3. **Go** (Optional - if building from source)
   - Version: 1.22 or higher
   - Download: https://go.dev/dl/
   - Used for: Kafka consumer

4. **Git** (Recommended)
   - For version control and updates

#### Optional Software

- **MongoDB Compass**: GUI for MongoDB
- **DBeaver**: Universal database tool
- **Postman**: API testing

### System Requirements

**Minimum:**
- **RAM**: 8 GB
- **CPU**: 4 cores
- **Disk**: 10 GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux

**Recommended:**
- **RAM**: 16 GB
- **CPU**: 8 cores
- **Disk**: 20 GB free space
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+

### Network Requirements

- Internet connection (for MongoDB Atlas)
- Ports 3001, 5173, 9092, 5432, 8080, 9000, 2181 available
- No VPN restrictions on MongoDB Atlas connection

---

## Quick Start Guide

### Step 1: Clone/Access Project

```bash
cd C:\Users\bdhayalesh\Desktop\KTern\kafka
```

### Step 2: Start Docker Infrastructure

```bash
# Start all Docker services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# zookeeper     Running
# kafka         Running
# timescaledb   Running
# adminer       Running
# kafdrop       Running
```

### Step 3: Verify Kafka Topic

```bash
# Access Kafdrop UI
# Open browser: http://localhost:9000

# Or use CLI to list topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Should show: todo-history-events
```

### Step 4: Start Backend Server

```bash
# Navigate to backend
cd todo_serer

# Install dependencies (first time only)
npm install

# Start server
npm run dev

# Expected output:
# ✅ MongoDB connected
# 📝 Express: Publishing events to Kafka
# Server running on port 3001
```

### Step 5: Start Frontend

```bash
# Open new terminal
cd todo

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
```

### Step 6: Start Go Consumer

```bash
# Open new terminal
cd go-consumer

# Run pre-compiled binary
.\consumer.exe

# Expected output:
# 🚀 Starting Go Kafka Consumer Service
# ✅ Connected to TimescaleDB
# 🚀 Go Kafka Consumer started on topic: todo-history-events
```

### Step 7: Access Application

1. **Open browser**: http://localhost:5173
2. **Login** with demo user: `Dhaya` / `Dhaya123`
3. **Create a group** and add tasks
4. **Check logs** in the UI

### Verification Checklist

- [ ] Docker containers running: `docker-compose ps`
- [ ] Backend accessible: `curl http://localhost:3001/api/health`
- [ ] Frontend accessible: http://localhost:5173
- [ ] Kafka topic exists: Check Kafdrop at http://localhost:9000
- [ ] Go consumer processing: Check console output
- [ ] Database receiving logs: Check Adminer at http://localhost:8080

---

## Docker Infrastructure

### Docker Compose Configuration

**File**: `docker-compose.yml`

#### Services Overview

| Service | Image | Purpose | Dependencies |
|---------|-------|---------|--------------|
| **zookeeper** | confluentinc/cp-zookeeper:7.6.1 | Kafka coordination | None |
| **kafka** | confluentinc/cp-kafka:7.6.1 | Message broker | zookeeper |
| **timescaledb** | timescale/timescaledb:latest-pg16 | Time-series DB | None |
| **adminer** | adminer:latest | Database UI | timescaledb |
| **kafdrop** | obsidiandynamics/kafdrop | Kafka UI | kafka |

### Zookeeper Service

**Purpose**: Manages Kafka cluster metadata and coordination

**Configuration**:
```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.6.1
  container_name: zookeeper
  ports:
    - "2181:2181"
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
  volumes:
    - zookeeper-data:/var/lib/zookeeper/data
    - zookeeper-log:/var/lib/zookeeper/log
```

**Key Settings**:
- `CLIENT_PORT`: Port for Kafka to connect
- `TICK_TIME`: Basic time unit (milliseconds)

### Kafka Service

**Purpose**: Event streaming platform

**Configuration**:
```yaml
kafka:
  image: confluentinc/cp-kafka:7.6.1
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"    # External access
    - "29092:29092"  # Internal Docker network
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    
    # Dual listener configuration
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,DOCKER://0.0.0.0:29092
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,DOCKER://kafka:29092
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,DOCKER:PLAINTEXT
    KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
    
    # Replication settings
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    
    # Auto-create topics
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
  volumes:
    - kafka-data:/var/lib/kafka/data
```

**Listener Configuration Explained**:

| Listener | Address | Purpose | Used By |
|----------|---------|---------|---------|
| **PLAINTEXT** | localhost:9092 | Host machine access | Backend, Go consumer |
| **DOCKER** | kafka:29092 | Docker network access | Kafdrop |

### TimescaleDB Service

**Purpose**: Time-series database for event logs

**Configuration**:
```yaml
timescaledb:
  image: timescale/timescaledb:latest-pg16
  container_name: timescaledb
  restart: always
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: todo_history
  ports:
    - "5432:5432"
  volumes:
    - timescaledb-data:/var/lib/postgresql/data
```

**Database Details**:
- **Schema**: Auto-created by Go consumer on first run
- **Extensions**: TimescaleDB extension enabled
- **Hypertable**: `todo_event_logs` partitioned by time

### Adminer Service

**Purpose**: Web-based database management UI

**Access**: http://localhost:8080

**Login Credentials**:
- **System**: PostgreSQL
- **Server**: timescaledb
- **Username**: postgres
- **Password**: postgres
- **Database**: todo_history

**Usage**:
```
1. Open http://localhost:8080
2. Enter connection details
3. Click "Login"
4. Browse tables, run queries
```

### Kafdrop Service

**Purpose**: Web UI for Apache Kafka

**Access**: http://localhost:9000

**Features**:
- View topics and partitions
- Browse messages
- Monitor consumer groups
- View topic configuration

**Configuration**:
```yaml
kafdrop:
  image: obsidiandynamics/kafdrop
  container_name: kafdrop
  depends_on:
    - kafka
  ports:
    - "9000:9000"
  environment:
    KAFKA_BROKERCONNECT: "kafka:29092"  # Uses Docker network
    JVM_OPTS: "-Xms32M -Xmx64M"
    SERVER_PORT: 9000
```

**Note**: Must use `kafka:29092` (internal Docker address), not `localhost:9092`

### Docker Commands Reference

#### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d kafka

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f kafka
```

#### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v

# Stop specific service
docker-compose stop kafka
```

#### Service Management

```bash
# Restart service
docker-compose restart kafka

# View service status
docker-compose ps

# View resource usage
docker stats
```

#### Accessing Containers

```bash
# Execute command in container
docker exec -it kafka bash

# View container logs
docker logs -f kafka

# Inspect container
docker inspect kafka
```

#### Data Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect kafka_kafka-data

# Remove unused volumes
docker volume prune
```

### Troubleshooting Docker

#### Services Won't Start

```bash
# Check Docker is running
docker --version
docker-compose --version

# Check for port conflicts
netstat -an | findstr "9092"

# View detailed logs
docker-compose logs kafka
```

#### Kafka Not Accessible

```bash
# From host machine
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# From Docker network
docker exec -it kafka kafka-topics --bootstrap-server kafka:29092 --list
```

#### Data Persistence Issues

```bash
# Check volumes exist
docker volume ls | findstr kafka

# Backup volume
docker run --rm -v kafka_kafka-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/kafka-backup.tar.gz /data
```

---

## Apache Kafka Operations

### Kafka Architecture in This System

```
┌─────────────────────────────────────────────┐
│            Kafka Ecosystem                   │
├─────────────────────────────────────────────┤
│                                             │
│  Zookeeper (Metadata & Coordination)        │
│  ↓                                          │
│  Kafka Broker (Message Storage & Routing)   │
│  ↓                                          │
│  Topic: todo-history-events                 │
│    ├─ Partition 0 (Default)                │
│    └─ Replication: 1                        │
│  ↓                                          │
│  Producer: Express.js Backend               │
│  ↓                                          │
│  Consumer Group: todo-consumer-group-go     │
│    └─ Consumer: Go Service                  │
└─────────────────────────────────────────────┘
```

### Topic Configuration

**Topic Name**: `todo-history-events`

**Configuration**:
- **Partitions**: 1 (single partition)
- **Replication Factor**: 1 (no replication)
- **Retention**: Default (7 days)
- **Cleanup Policy**: Delete (removes old messages)
- **Auto-Create**: Enabled

### Kafka CLI Commands

#### Topic Management

```bash
# Access Kafka container
docker exec -it kafka bash

# List all topics
kafka-topics --bootstrap-server localhost:9092 --list

# Describe topic
kafka-topics --bootstrap-server localhost:9092 \
  --describe \
  --topic todo-history-events

# Create topic manually (if needed)
kafka-topics --bootstrap-server localhost:9092 \
  --create \
  --topic todo-history-events \
  --partitions 1 \
  --replication-factor 1

# Delete topic
kafka-topics --bootstrap-server localhost:9092 \
  --delete \
  --topic todo-history-events

# Alter topic configuration
kafka-configs --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name todo-history-events \
  --alter \
  --add-config retention.ms=604800000  # 7 days
```

#### Producer Testing

```bash
# Produce messages manually
kafka-console-producer --bootstrap-server localhost:9092 \
  --topic todo-history-events

# Then type JSON messages:
{"eventType":"created","timestamp":"2025-11-10T15:30:45Z","payload":{"entity":"Task","entityId":"test-123","groupId":"group-1","groupName":"Test","changes":"Test event","user":"tester","workspace":"default"}}

# Press Ctrl+C to exit
```

#### Consumer Testing

```bash
# Consume from beginning
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --from-beginning

# Consume latest only
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events

# Consume with key
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --property print.key=true \
  --property print.value=true \
  --from-beginning
```

#### Consumer Group Management

```bash
# List consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Describe consumer group
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe \
  --group todo-consumer-group-go

# Output shows:
# - Current offset
# - Log end offset
# - Lag (difference between current and end)

# Reset consumer group offset
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group todo-consumer-group-go \
  --reset-offsets \
  --to-earliest \
  --topic todo-history-events \
  --execute
```

#### Monitoring Commands

```bash
# Check broker status
kafka-broker-api-versions --bootstrap-server localhost:9092

# View topic partitions
kafka-topics --bootstrap-server localhost:9092 \
  --describe \
  --topic todo-history-events

# Check log directories
kafka-log-dirs --bootstrap-server localhost:9092 \
  --describe \
  --topic-list todo-history-events
```

### Message Format

**Schema**:
```json
{
  "eventType": "created | updated | deleted | status_changed | commented",
  "timestamp": "ISO 8601 string",
  "payload": {
    "entity": "Group | Task",
    "entityId": "UUID string",
    "groupId": "UUID or null",
    "groupName": "string or null",
    "taskId": "UUID or null",
    "taskName": "string or null",
    "changes": "Human-readable description",
    "user": "username",
    "workspace": "workspace name",
    "timestamp": "ISO 8601 string (duplicate)"
  }
}
```

**Example Message**:
```json
{
  "eventType": "created",
  "timestamp": "2025-11-10T15:30:45.123Z",
  "payload": {
    "entity": "Task",
    "entityId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "groupId": "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f56789",
    "groupName": "Project Alpha",
    "taskId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "taskName": "Implement authentication",
    "changes": "Task 'Implement authentication' was created",
    "user": "john_doe",
    "workspace": "default",
    "timestamp": "2025-11-10T15:30:45.123Z"
  }
}
```

### Using Kafdrop UI

**Access**: http://localhost:9000

**Features**:

1. **Topic Browser**
   - Navigate to "Topics"
   - Click "todo-history-events"
   - View partition details

2. **Message Viewer**
   - Click "View Messages"
   - Select partition (0)
   - Browse messages
   - View message content as JSON

3. **Consumer Groups**
   - Navigate to "Consumers"
   - View active consumer groups
   - Check consumer lag

4. **Broker Status**
   - View broker health
   - Check configuration
   - Monitor resource usage

### Performance Tuning

#### Producer Configuration (Express.js)

Current settings (in `kafka/producer.js`):
```javascript
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
})
```

**Recommended for Production**:
```javascript
const producer = kafka.producer({
  allowAutoTopicCreation: false,
  transactionTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
    maxRetryTime: 30000
  },
  compression: CompressionTypes.GZIP
})
```

#### Consumer Configuration (Go)

Current settings (in `kafka/consumer.go`):
```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "todo-history-events",
    GroupID: "todo-consumer-group-go",
})
```

**Recommended for Production**:
```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"localhost:9092"},
    Topic:          "todo-history-events",
    GroupID:        "todo-consumer-group-go",
    MinBytes:       1,
    MaxBytes:       10e6,
    CommitInterval: time.Second,
    StartOffset:    kafka.LastOffset,
    MaxWait:        time.Second,
})
```

---

## Backend Server (Express.js)

### Server Overview

**Location**: `todo_serer/` directory

**Technology**: Node.js + Express.js 5.1.0

**Port**: 3001

**Purpose**: REST API server for task management

### Project Structure

```
todo_serer/
├── index.js                 # Main entry point
├── package.json             # Dependencies
├── .env                     # Environment config (active)
├── .env.example             # Environment template
│
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Group.js
│   ├── Task.js
│   └── Comment.js
│
├── routes/                  # API route handlers
│   ├── auth.js             # Authentication
│   ├── groups.js           # Group management
│   ├── tasks.js            # Task management
│   └── logs.js             # Event logs
│
├── kafka/                   # Kafka integration
│   ├── producer.js         # Event publishing
│   └── consumer.js         # DEPRECATED
│
├── db/                      # Database utilities
│   ├── timescale.js        # TimescaleDB queries
│   └── seedUsers.js        # Default users
│
└── test-*.js               # Test scripts
```

### Environment Configuration

**File**: `todo_serer/.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB (Cloud)
MONGODB_URI=mongodb+srv://dhayalesh25_db_user:MTAAJwvayo6dhBKC@todo.v4defom.mongodb.net/?appName=todo

# Kafka Configuration
KAFKA_ENABLED=true
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=todo-history-events
KAFKAJS_NO_PARTITIONER_WARNING=1

# TimescaleDB Configuration
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5432
TIMESCALE_DATABASE=todo_history
TIMESCALE_USER=postgres
TIMESCALE_PASSWORD=postgres
```

### Starting the Backend

```bash
# Navigate to directory
cd todo_serer

# Install dependencies (first time)
npm install

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected Console Output**:
```
✅ MongoDB connected
✅ Default users seeded
📝 Express: Publishing events to Kafka (Go consumer writes logs)
Server running on port 3001 - Accepting requests from any origin
```

### API Endpoints Summary

**Base URL**: `http://localhost:3001/api`

#### Health Check
- `GET /health` - Server health status

#### Authentication
- `POST /auth/login` - User login
- `GET /auth/users` - List all users

#### Groups
- `GET /groups` - Get all groups
- `POST /groups` - Create group
- `GET /groups/:id` - Get specific group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group

#### Tasks
- `POST /groups/:groupId/tasks` - Create task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `PUT /tasks/:id/status` - Update task status
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add comment
- `GET /tasks/:id/comments` - Get comments

#### Event Logs
- `GET /logs/groups` - Get all groups with log counts
- `GET /logs/group/:groupId` - Get logs for group
- `GET /logs/group/:groupId/tasks` - Get task summary
- `GET /logs/task/:taskId` - Get logs for task

### Database Models

#### MongoDB Collections

**Users Collection**:
```javascript
{
  username: String (required, unique),
  password: String (required),  // ⚠️ Plain text (not secure)
  createdAt: Date,
  updatedAt: Date
}
```

**Default Users**:
- Avinash / Avinash123
- Dhaya / Dhaya123
- Ashok / Ashok123
- Arun / Arun123
- Cathrine / Cathrine123

**Groups Collection**:
```javascript
{
  name: String (required),
  discussion: String,
  tasks: [ObjectId] (refs Task),
  createdAt: Date,
  updatedAt: Date,
  taskCount: Number (virtual)
}
```

**Tasks Collection**:
```javascript
{
  groupId: ObjectId (required, refs Group),
  name: String (required),
  description: String,
  status: String (enum: ['New', 'Backlog', 'In Progress', 'Completed', 'Approved']),
  startDate: String,
  endDate: String,
  comments: [ObjectId] (refs Comment),
  createdAt: Date,
  updatedAt: Date,
  commentCount: Number (virtual)
}
```

**Comments Collection**:
```javascript
{
  taskId: ObjectId (required, refs Task),
  text: String (required),
  timestamp: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### Kafka Integration

**Producer**: `todo_serer/kafka/producer.js`

**Event Publishing**:
```javascript
// All mutating operations publish events
await kafkaProducer.publishEvent(eventType, {
  entity: 'Task',
  entityId: task._id,
  groupId: group._id,
  groupName: group.name,
  taskId: task._id,
  taskName: task.name,
  changes: 'Task created',
  user: 'username',
  workspace: 'default',
  timestamp: new Date().toISOString()
})
```

**Event Types Published**:
- `created` - Entity created
- `updated` - Entity modified
- `deleted` - Entity removed
- `status_changed` - Task status update
- `commented` - Comment added

---

## Frontend Application (React)

### Frontend Overview

**Location**: `todo/` directory

**Technology**: React 19 + Vite 7

**Port**: 5173 (default, may vary)

**Purpose**: User interface for task management

### Project Structure

```
todo/
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── .env                    # Environment config
│
├── src/
│   ├── main.jsx           # Application entry
│   ├── App.jsx            # Root component
│   ├── App.css            # App styles
│   ├── index.css          # Global styles
│   │
│   ├── components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── EditGroupModal.jsx
│   │   └── EditTaskModal.jsx
│   │
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   │
│   ├── api/              # API client
│   │   └── todoService.js
│   │
│   ├── GroupsList.jsx    # Home page
│   ├── GroupDetails.jsx  # Group view
│   └── TodoContext.jsx   # Todo state
│
└── public/
    └── vite.svg
```

### Environment Configuration

**File**: `todo/.env`

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

### Starting the Frontend

```bash
# Navigate to directory
cd todo

# Install dependencies (first time)
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Key Features

#### 1. Authentication System

**Component**: `src/components/Login.jsx`

**Features**:
- Username/password login
- Demo user quick access
- Session persistence (localStorage)
- Auto-login on app load

**Demo Users**:
```
Avinash / Avinash123
Dhaya / Dhaya123
Ashok / Ashok123
Arun / Arun123
Cathrine / Cathrine123
```

#### 2. Group Management

**Component**: `src/GroupsList.jsx`

**Features**:
- View all groups
- Create new group
- Edit group details
- Delete group (with confirmation)
- View group activity logs
- Navigate to group details

#### 3. Task Management

**Component**: `src/GroupDetails.jsx`

**Features**:
- View all tasks in group
- Create new task
- Edit task details
- Update task status
- Delete task
- Add comments
- View task logs

#### 4. Activity Logs

**Features**:
- Real-time event log display
- Group-level logs
- Task-level logs
- Timestamp display
- User tracking
- Change descriptions

### State Management

**Architecture**:
```
AuthContext (Authentication)
    ↓
TodoContext (Application Data)
    ↓
Components (UI)
```

**AuthContext**: `src/contexts/AuthContext.jsx`
- User authentication state
- Login/logout functions
- Session persistence

**TodoContext**: `src/TodoContext.jsx`
- Groups and tasks data
- CRUD operations
- API integration

### API Integration

**Service**: `src/api/todoService.js`

**Methods**:
- `login()` - User authentication
- `getGroups()` - Fetch all groups
- `createGroup()` - Create new group
- `updateGroup()` - Update group
- `deleteGroup()` - Delete group
- `createTask()` - Create new task
- `updateTask()` - Update task
- `deleteTask()` - Delete task
- `updateTaskStatus()` - Change task status
- `addComment()` - Add task comment
- `getGroupLogs()` - Fetch group logs
- `getAllGroupsLogs()` - Fetch all logs

### Routing

**Routes**:
- `/` - Groups list (home)
- `/group/:groupId` - Group details

**Protected Routes**:
- All routes require authentication
- Automatic redirect to login if not authenticated

---

## Go Kafka Consumer

### Consumer Overview

**Location**: `go-consumer/` directory

**Technology**: Go 1.22

**Purpose**: Kafka event consumer and TimescaleDB writer

### Project Structure

```
go-consumer/
├── main.go              # Entry point
├── go.mod               # Module definition
├── go.sum               # Dependency checksums
├── consumer.exe         # Compiled binary (Windows)
│
├── kafka/
│   └── consumer.go     # Kafka consumer logic
│
├── db/
│   └── timescale.go    # TimescaleDB operations
│
└── api/
    └── server.go       # DEPRECATED (not used)
```

### Starting the Consumer

```bash
# Navigate to directory
cd go-consumer

# Run pre-compiled binary
.\consumer.exe

# Or build from source
go build -o consumer.exe main.go
.\consumer.exe
```

**Expected Output**:
```
🚀 Starting Go Kafka Consumer Service
📋 Role: Consume Kafka events → Write to TimescaleDB
✅ Connected to TimescaleDB
🧩 TimescaleDB schema verified
📡 Connecting to Kafka broker...
🚀 Go Kafka Consumer started on topic: todo-history-events
```

### Consumer Architecture

```
┌─────────────────────────────────────┐
│     Kafka Consumer Loop             │
│                                     │
│  while true:                        │
│    1. Read message from Kafka       │
│    2. Parse JSON → Event struct     │
│    3. Extract relationships         │
│    4. Insert to TimescaleDB         │
│    5. Log to console                │
│    6. Handle errors                 │
└─────────────────────────────────────┘
```

### Event Processing

**Flow**:
1. **Read** message from Kafka (blocking)
2. **Unmarshal** JSON to Event struct
3. **Parse** timestamp (ISO 8601 → UTC)
4. **Extract** group/task relationships
5. **Insert** into `todo_event_logs` table
6. **Log** processed event to console
7. **Loop** back to step 1

**Error Handling**:
- Kafka errors: Log and retry after 2 seconds
- JSON parse errors: Log and skip message
- DB errors: Log and skip message
- Never crashes - continues processing

### Database Operations

**InsertLog Function**:
```go
func InsertLog(
  eventType, entity, entityId,
  groupId, groupName, taskId, taskName,
  changes, user, workspace string,
  timestamp time.Time
) error
```

**Query Functions** (for Express.js):
- `GetGroupLogs(groupId)` - Fetch group logs
- `GetTaskLogs(taskId)` - Fetch task logs
- `GetGroupsSummary()` - Aggregate stats
- `GetGroupTasksSummary(groupId)` - Task stats

---

## Complete Data Flow

### End-to-End Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│              COMPLETE DATA FLOW SEQUENCE                        │
└────────────────────────────────────────────────────────────────┘

USER ACTION: Create Task
     │
     ▼
┌─────────────────────────────────┐
│ Frontend (React)                │
│ POST /api/groups/:id/tasks      │
└──────────────┬──────────────────┘
               │
               │ HTTP Request
               │ Body: {name, description}
               │
               ▼
┌─────────────────────────────────┐
│ Express.js Backend              │
│                                 │
│ 1. Validate request             │
│ 2. Insert to MongoDB            │
│    - Create Task document       │
│    - Update Group.tasks array   │
│ 3. Return HTTP 201              │
└──────────────┬──────────────────┘
               │
               │ Async (setImmediate)
               │
               ▼
┌─────────────────────────────────┐
│ Kafka Producer                  │
│                                 │
│ Publish event:                  │
│ {                               │
│   eventType: "created",         │
│   payload: {...}                │
│ }                               │
└──────────────┬──────────────────┘
               │
               │ Message
               │
               ▼
┌─────────────────────────────────┐
│ Kafka Topic                     │
│ todo-history-events             │
│ Partition 0                     │
└──────────────┬──────────────────┘
               │
               │ Consumer reads
               │
               ▼
┌─────────────────────────────────┐
│ Go Kafka Consumer               │
│                                 │
│ 1. Read message                 │
│ 2. Parse JSON                   │
│ 3. Extract data                 │
│ 4. Insert to TimescaleDB        │
└──────────────┬──────────────────┘
               │
               │ SQL INSERT
               │
               ▼
┌─────────────────────────────────┐
│ TimescaleDB                     │
│ todo_event_logs                 │
│                                 │
│ New row inserted:               │
│ - event_type: created           │
│ - entity: Task                  │
│ - group_id: ...                 │
│ - task_id: ...                  │
│ - changes: "Task created"       │
└──────────────┬──────────────────┘
               │
               │ User requests logs
               │
               ▼
┌─────────────────────────────────┐
│ Express.js Logs API             │
│ GET /api/logs/group/:id         │
│                                 │
│ Query TimescaleDB:              │
│ SELECT * FROM todo_event_logs   │
│ WHERE group_id = ?              │
└──────────────┬──────────────────┘
               │
               │ HTTP Response
               │ JSON array of logs
               │
               ▼
┌─────────────────────────────────┐
│ Frontend (React)                │
│ Display logs in UI              │
└─────────────────────────────────┘
```

### Data Consistency

**Write Path** (MongoDB):
- User actions → MongoDB → HTTP response
- Primary data store
- Immediate consistency
- Transaction support

**Event Path** (Kafka → TimescaleDB):
- Asynchronous
- Eventually consistent
- Non-blocking
- At-least-once delivery

**Read Path** (Logs):
- Query TimescaleDB
- Time-series optimized
- Hypertable partitioning
- Index-optimized queries

---

## Database Schemas

### MongoDB Schema (Operational Data)

#### Users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String,          // ⚠️ Plain text
  createdAt: Date,
  updatedAt: Date
}
```

#### Groups
```javascript
{
  _id: ObjectId,
  name: String,
  discussion: String,
  tasks: [ObjectId],         // References to Tasks
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks
```javascript
{
  _id: ObjectId,
  groupId: ObjectId,         // Reference to Group
  name: String,
  description: String,
  status: String,            // New|Backlog|In Progress|Completed|Approved
  startDate: String,
  endDate: String,
  comments: [ObjectId],      // References to Comments
  createdAt: Date,
  updatedAt: Date
}
```

#### Comments
```javascript
{
  _id: ObjectId,
  taskId: ObjectId,          // Reference to Task
  text: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TimescaleDB Schema (Event Logs)

#### todo_event_logs (Hypertable)

```sql
CREATE TABLE todo_event_logs (
  id SERIAL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  
  -- Relationships
  group_id VARCHAR(100),
  group_name VARCHAR(255),
  task_id VARCHAR(100),
  task_name VARCHAR(255),
  
  -- Event details
  changes TEXT,
  user_name VARCHAR(100),
  workspace VARCHAR(100),
  event_data JSONB,
  
  PRIMARY KEY (timestamp, id)
);

-- Convert to hypertable
SELECT create_hypertable('todo_event_logs', 'timestamp',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Indexes
CREATE INDEX idx_event_type ON todo_event_logs(event_type, timestamp DESC);
CREATE INDEX idx_group_id ON todo_event_logs(group_id, timestamp DESC);
CREATE INDEX idx_task_id ON todo_event_logs(task_id, timestamp DESC);
CREATE INDEX idx_entity ON todo_event_logs(entity, entity_id, timestamp DESC);
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Auto-increment ID |
| timestamp | TIMESTAMPTZ | Event time (UTC) |
| event_type | VARCHAR(50) | Event type (created, updated, etc.) |
| entity | VARCHAR(50) | Entity type (Group, Task) |
| entity_id | VARCHAR(100) | MongoDB ObjectId |
| group_id | VARCHAR(100) | Associated group |
| group_name | VARCHAR(255) | Group name (denormalized) |
| task_id | VARCHAR(100) | Associated task |
| task_name | VARCHAR(255) | Task name (denormalized) |
| changes | TEXT | Human-readable description |
| user_name | VARCHAR(100) | User who made change |
| workspace | VARCHAR(100) | Workspace context |
| event_data | JSONB | Additional data (currently unused) |

---

## API Reference

### Authentication API

#### POST /api/auth/login
Login with username and password.

**Request**:
```json
{
  "username": "Dhaya",
  "password": "Dhaya123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Dhaya"
  }
}
```

#### GET /api/auth/users
Get all users (for testing).

**Response**:
```json
{
  "users": [
    {"_id": "...", "username": "Dhaya"},
    {"_id": "...", "username": "Avinash"}
  ]
}
```

### Groups API

#### GET /api/groups
Get all groups with tasks.

**Response**:
```json
{
  "groups": [
    {
      "_id": "...",
      "name": "Project Alpha",
      "discussion": "...",
      "tasks": [...],
      "taskCount": 5
    }
  ]
}
```

#### POST /api/groups
Create a new group.

**Request**:
```json
{
  "name": "Project Beta",
  "discussion": "New project"
}
```

**Response**:
```json
{
  "group": {
    "_id": "...",
    "name": "Project Beta",
    "discussion": "New project",
    "tasks": []
  }
}
```

#### GET /api/groups/:id
Get specific group with tasks and comments.

#### PUT /api/groups/:id
Update group details.

**Request**:
```json
{
  "name": "Updated Name",
  "discussion": "Updated discussion"
}
```

#### DELETE /api/groups/:id
Delete group (cascades to tasks and comments).

### Tasks API

#### POST /api/groups/:groupId/tasks
Create task in group.

**Request**:
```json
{
  "name": "Implement feature",
  "description": "Feature details",
  "status": "New",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

#### PUT /api/tasks/:id
Update task details.

#### PUT /api/tasks/:id/status
Update task status.

**Request**:
```json
{
  "status": "In Progress"
}
```

#### DELETE /api/tasks/:id
Delete task (cascades to comments).

#### POST /api/tasks/:id/comments
Add comment to task.

**Request**:
```json
{
  "text": "Comment text here"
}
```

#### GET /api/tasks/:id/comments
Get all comments for task.

### Logs API

#### GET /api/logs/groups
Get all groups with log counts.

**Response**:
```json
{
  "groups": [
    {
      "group_id": "...",
      "group_name": "Project Alpha",
      "log_count": "45",
      "last_activity": "2025-11-10T15:30:45Z"
    }
  ]
}
```

#### GET /api/logs/group/:groupId
Get event logs for specific group.

**Query Parameters**:
- `limit`: Number of logs (default: 100)

**Response**:
```json
{
  "logs": [
    {
      "id": 123,
      "timestamp": "2025-11-10T15:30:45Z",
      "event_type": "created",
      "entity": "Task",
      "group_name": "Project Alpha",
      "task_name": "Feature X",
      "changes": "Task created",
      "user_name": "Dhaya"
    }
  ]
}
```

#### GET /api/logs/task/:taskId
Get event logs for specific task.

---

## Event System

### Event Types

| Event Type | Trigger | Entities |
|------------|---------|----------|
| **created** | Entity creation | Group, Task |
| **updated** | Entity modification | Group, Task |
| **deleted** | Entity deletion | Group, Task |
| **status_changed** | Task status change | Task |
| **commented** | Comment added | Task |

### Event Payload Structure

```json
{
  "eventType": "created",
  "timestamp": "2025-11-10T15:30:45.123Z",
  "payload": {
    "entity": "Task",
    "entityId": "uuid",
    "groupId": "group-uuid",
    "groupName": "Project Alpha",
    "taskId": "task-uuid",
    "taskName": "Feature X",
    "changes": "Task 'Feature X' was created",
    "user": "Dhaya",
    "workspace": "default",
    "timestamp": "2025-11-10T15:30:45.123Z"
  }
}
```

### Event Flow Timeline

```
T+0ms    User clicks "Create Task"
T+10ms   Frontend sends POST request
T+50ms   Backend validates & writes to MongoDB
T+60ms   Backend returns HTTP 201 to frontend
T+65ms   Frontend updates UI
T+70ms   Backend publishes event to Kafka (async)
T+80ms   Kafka receives and stores event
T+100ms  Go consumer reads event
T+110ms  Go consumer inserts to TimescaleDB
T+120ms  Log available for querying
```

**Key Points**:
- User sees result immediately (T+65ms)
- Event logging happens asynchronously
- Logs available within ~120ms
- Non-blocking architecture

---

## Monitoring & Debugging

### Monitoring Tools

#### 1. Kafdrop (Kafka UI)
**URL**: http://localhost:9000

**Features**:
- View topics and messages
- Monitor consumer groups
- Check consumer lag
- View broker status

**Usage**:
```
1. Open http://localhost:9000
2. Navigate to Topics → todo-history-events
3. Click "View Messages" to see events
4. Check "Consumers" for Go consumer status
```

#### 2. Adminer (Database UI)
**URL**: http://localhost:8080

**Login**:
- System: PostgreSQL
- Server: timescaledb
- Username: postgres
- Password: postgres
- Database: todo_history

**Usage**:
```sql
-- View recent events
SELECT * FROM todo_event_logs 
ORDER BY timestamp DESC 
LIMIT 20;

-- Count events by type
SELECT event_type, COUNT(*) 
FROM todo_event_logs 
GROUP BY event_type;

-- Check specific group
SELECT * FROM todo_event_logs
WHERE group_id = 'your-group-id'
ORDER BY timestamp DESC;
```

### Health Checks

#### Backend Health
```bash
curl http://localhost:3001/api/health
```

**Expected**:
```json
{"success": true, "message": "Todo Manager API is running"}
```

#### Kafka Health
```bash
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
```

**Expected**: Should show `todo-history-events`

#### TimescaleDB Health
```bash
docker exec -it timescaledb psql -U postgres -d todo_history -c "SELECT COUNT(*) FROM todo_event_logs;"
```

#### Go Consumer Health
Check console output for:
```
📝 [created] HH:MM:SS - Event description
```

### Logging

#### Backend Logs
```bash
cd todo_serer
npm run dev
```

**Look for**:
- ✅ MongoDB connected
- 📝 Express: Publishing events to Kafka

#### Go Consumer Logs
```bash
cd go-consumer
.\consumer.exe
```

**Look for**:
- 🚀 Go Kafka Consumer started
- 📝 [eventType] timestamp - changes

#### Docker Logs
```bash
# Kafka logs
docker-compose logs -f kafka

# TimescaleDB logs
docker-compose logs -f timescaledb

# All services
docker-compose logs -f
```

### Performance Monitoring

#### Kafka Consumer Lag
```bash
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group todo-consumer-group-go
```

**Metrics**:
- **CURRENT-OFFSET**: Messages processed
- **LOG-END-OFFSET**: Total messages
- **LAG**: Messages behind

**Healthy**: Lag < 100 messages

#### Database Performance
```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('todo_event_logs'));

-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM todo_event_logs
WHERE group_id = 'test'
ORDER BY timestamp DESC
LIMIT 100;
```

---

## Troubleshooting Guide

### Common Issues

#### Issue: Frontend won't start

**Symptoms**:
```
Error: Cannot find module 'vite'
```

**Solution**:
```bash
cd todo
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: Backend can't connect to MongoDB

**Symptoms**:
```
❌ MongoDB connection error
```

**Solutions**:
1. Check internet connection
2. Verify MongoDB Atlas credentials in `.env`
3. Check IP whitelist in MongoDB Atlas
4. Try alternate network (disable VPN)

#### Issue: Kafka not accessible

**Symptoms**:
```
❌ Read error: connection refused
```

**Solutions**:
```bash
# Check Kafka is running
docker-compose ps

# Restart Kafka
docker-compose restart kafka

# Check logs
docker-compose logs kafka

# Verify topic exists
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
```

#### Issue: Go consumer not processing events

**Symptoms**:
- No console output
- Logs not appearing in database

**Solutions**:
1. **Check Kafka connection**:
```bash
# Test from host
telnet localhost 9092
```

2. **Check TimescaleDB connection**:
```bash
docker exec -it timescaledb psql -U postgres -d todo_history
```

3. **Verify events in Kafka**:
- Open Kafdrop: http://localhost:9000
- Check topic: todo-history-events
- Verify messages exist

4. **Restart consumer**:
```bash
# Stop (Ctrl+C)
# Restart
cd go-consumer
.\consumer.exe
```

#### Issue: Events not being published

**Symptoms**:
- Kafka has no messages
- Consumer shows no activity

**Solutions**:
1. Check backend environment:
```bash
# In todo_serer/.env
KAFKA_ENABLED=true
KAFKA_BROKER=localhost:9092
```

2. Restart backend:
```bash
cd todo_serer
npm run dev
```

3. Test manually:
```bash
# Create a group via API
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group"}'

# Check Kafdrop for new message
```

#### Issue: Database schema not created

**Symptoms**:
```
ERROR: relation "todo_event_logs" does not exist
```

**Solutions**:
1. **Manual schema creation**:
```sql
-- Connect to TimescaleDB
docker exec -it timescaledb psql -U postgres -d todo_history

-- Create schema (copy from GO_CONSUMER_DOCUMENTATION.md)
```

2. **Restart Go consumer** (auto-creates schema):
```bash
cd go-consumer
.\consumer.exe
```

### Debugging Steps

#### Step 1: Verify All Services Running
```bash
# Docker services
docker-compose ps

# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:5173

# All should return successfully
```

#### Step 2: Check Connectivity
```bash
# Kafka
telnet localhost 9092

# TimescaleDB
telnet localhost 5432

# Backend
telnet localhost 3001
```

#### Step 3: Check Logs
```bash
# Backend
cd todo_serer && npm run dev

# Go Consumer
cd go-consumer && .\consumer.exe

# Docker
docker-compose logs -f
```

#### Step 4: Test Event Flow
```bash
# 1. Create event via API
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Debug Test"}'

# 2. Check Kafdrop: http://localhost:9000
# Should see new message

# 3. Check Go consumer console
# Should see: 📝 [created] ...

# 4. Check database
docker exec -it timescaledb psql -U postgres -d todo_history
SELECT * FROM todo_event_logs ORDER BY timestamp DESC LIMIT 1;
```

### Recovery Procedures

#### Full System Reset

```bash
# 1. Stop all services
docker-compose down -v
cd todo_serer && # Stop (Ctrl+C)
cd todo && # Stop (Ctrl+C)
cd go-consumer && # Stop (Ctrl+C)

# 2. Clean up
docker volume prune -f

# 3. Restart Docker services
docker-compose up -d

# 4. Wait for services to be healthy
sleep 30

# 5. Start backend
cd todo_serer && npm run dev &

# 6. Start frontend
cd todo && npm run dev &

# 7. Start Go consumer
cd go-consumer && .\consumer.exe &
```

---

## Production Deployment

### Production Architecture Overview

For production deployment, the system should be deployed using container orchestration platforms like Kubernetes or Docker Swarm, with proper load balancing, monitoring, and security measures.

#### Recommended Production Stack

| Component | Development | Production | Reasoning |
|-----------|-------------|------------|-----------|
| **Frontend** | Vite dev server | Nginx/Apache + static files | Performance, caching, SSL |
| **Backend** | Express dev mode | PM2 + Express | Process management, clustering |
| **Database** | MongoDB Atlas | MongoDB Atlas (M10+) | Managed, scalable, secure |
| **Event Stream** | Docker Kafka | Confluent Cloud / MSK | Managed, highly available |
| **Logs DB** | Docker TimescaleDB | Timescale Cloud / RDS | Managed, time-series optimized |
| **Reverse Proxy** | None | Nginx/Traefik | Load balancing, SSL termination |
| **Monitoring** | Console logs | ELK Stack / CloudWatch | Centralized logging, alerting |

### Infrastructure Requirements

#### Minimum Production Requirements

- **Compute**: 2 vCPUs, 4GB RAM per service
- **Storage**: 50GB SSD (20GB data + 30GB logs)
- **Network**: 100Mbps bandwidth
- **Availability**: 99.9% uptime SLA

#### Recommended Production Setup

- **Load Balancer**: AWS ALB / Nginx
- **Compute**: 4 vCPUs, 8GB RAM per service
- **Storage**: 100GB SSD with auto-scaling
- **Network**: 1Gbps bandwidth
- **Availability**: 99.95% uptime with multi-AZ

### Docker Production Configuration

#### Production Docker Compose

```yaml
version: '3.8'
services:
  # Production Kafka (External Managed Service Recommended)
  kafka:
    image: confluentinc/cp-kafka:7.6.1
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3  # Production: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"  # Security
      KAFKA_NUM_PARTITIONS: 6  # Multiple partitions
    volumes:
      - kafka-data:/var/lib/kafka/data
    deploy:
      replicas: 3  # Multi-broker cluster

  timescaledb:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: todo_history
      POSTGRES_MAX_CONNECTIONS: 200
    volumes:
      - timescaledb-data:/var/lib/postgresql/data
      - ./backups:/backups
    command: postgres -c shared_preload_libraries=timescaledb -c max_connections=200
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

### Environment Configuration for Production

#### Backend Production Environment

**File**: `todo_serer/.env.production`

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# MongoDB (Production Cluster)
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/todo_prod?retryWrites=true&w=majority

# Kafka (Production Cluster)
KAFKA_ENABLED=true
KAFKA_BROKER=kafka-1:9092,kafka-2:9092,kafka-3:9092
KAFKA_TOPIC=todo-history-events
KAFKA_CLIENT_ID=todo-backend-prod
KAFKAJS_NO_PARTITIONER_WARNING=1

# TimescaleDB (Production)
TIMESCALE_HOST=timescaledb-prod
TIMESCALE_PORT=5432
TIMESCALE_DATABASE=todo_history
TIMESCALE_USER=${DB_USER}
TIMESCALE_PASSWORD=${DB_PASSWORD}
TIMESCALE_SSL=true
TIMESCALE_MAX_CONNECTIONS=20

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PORT=3002
```

#### Frontend Production Environment

**File**: `todo/.env.production`

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_ENV=production
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Application Deployment Strategies

#### Backend Deployment

**Using PM2**:
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'todo-backend',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
}

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Frontend Deployment

**Build Process**:
```bash
cd todo

# Install dependencies
npm ci

# Build for production
npm run build

# The dist/ folder contains optimized static files
```

**Serve with Nginx**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/todo/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Go Consumer Deployment

**Systemd Service**:
```ini
# /etc/systemd/system/todo-consumer.service
[Unit]
Description=Todo Kafka Consumer Service
After=network.target

[Service]
Type=simple
User=todo
Group=todo
WorkingDirectory=/opt/todo-consumer
ExecStart=/opt/todo-consumer/consumer
Restart=always
RestartSec=5
Environment=KAFKA_BROKERS=kafka-1:9092,kafka-2:9092,kafka-3:9092
Environment=DATABASE_URL=postgres://user:pass@timescaledb:5432/todo_history
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Docker Container**:
```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o consumer .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/consumer .
CMD ["./consumer"]
```

### SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rest of configuration...
}
```

#### Automatic Certificate Renewal (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

### Load Balancing Configuration

#### Nginx Load Balancer

```nginx
upstream backend_servers {
    least_conn;
    server backend-1:3001;
    server backend-2:3001;
    server backend-3:3001;
}

upstream frontend_servers {
    ip_hash;
    server frontend-1:80;
    server frontend-2:80;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Health checks
        health_check interval=10 fails=3 passes=2;
    }
}
```

### Monitoring and Alerting Setup

#### Application Monitoring

**PM2 Monitoring**:
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View metrics
pm2 monit

# PM2 logs
pm2 logs
```

#### Infrastructure Monitoring

**Prometheus + Grafana**:
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'todo-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka:9092']

  - job_name: 'timescaledb'
    static_configs:
      - targets: ['timescaledb:5432']
```

#### Health Check Endpoints

**Backend Health Check** (`/api/health`):
```javascript
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();

    // Check Kafka
    const kafkaHealth = kafkaProducer.connected;

    // Check TimescaleDB
    const timescaleHealth = await checkTimescaleConnection();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: 'healthy',
        kafka: kafkaHealth ? 'healthy' : 'unhealthy',
        timescaledb: timescaleHealth ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Production Deployment Checklist

- [ ] **Infrastructure**
  - [ ] Provision servers/load balancers
  - [ ] Configure DNS and SSL certificates
  - [ ] Set up monitoring and alerting

- [ ] **Databases**
  - [ ] Create production MongoDB cluster
  - [ ] Set up TimescaleDB instance
  - [ ] Configure backups and replication

- [ ] **Kafka**
  - [ ] Set up production Kafka cluster
  - [ ] Create topics with proper configuration
  - [ ] Configure security and access controls

- [ ] **Backend**
  - [ ] Build and deploy with PM2
  - [ ] Configure environment variables
  - [ ] Set up reverse proxy

- [ ] **Frontend**
  - [ ] Build production assets
  - [ ] Deploy to web server
  - [ ] Configure CDN if needed

- [ ] **Go Consumer**
  - [ ] Build and deploy binary
  - [ ] Configure systemd service
  - [ ] Test event processing

- [ ] **Security**
  - [ ] Configure firewalls
  - [ ] Set up SSL/TLS
  - [ ] Implement rate limiting
  - [ ] Configure CORS properly

- [ ] **Monitoring**
  - [ ] Set up application monitoring
  - [ ] Configure log aggregation
  - [ ] Set up alerting rules

---

## Security Considerations

### Authentication & Authorization

#### Password Security

**Current Issues**:
- Plain text password storage (development only)
- No password complexity requirements

**Production Requirements**:
```javascript
// Use bcrypt for password hashing
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Hash password before storing
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### JWT Implementation

**Secure JWT Configuration**:
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'todo-app',
      audience: 'todo-users'
    }
  );
};

// Middleware for token verification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'todo-app',
      audience: 'todo-users'
    });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Data Protection

#### MongoDB Security

**Production Connection String**:
```
mongodb+srv://username:password@cluster.mongodb.net/database?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=true&w=majority
```

**Security Best Practices**:
- Use strong, unique passwords
- Enable SSL/TLS encryption
- Configure IP whitelisting
- Enable database auditing
- Regular security updates

#### API Security

**Rate Limiting**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

**Input Validation**:
```javascript
const Joi = require('joi');

const groupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  discussion: Joi.string().max(1000).optional()
});

const validateGroup = (req, res, next) => {
  const { error } = groupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

### Network Security

#### Firewall Configuration

**UFW Rules** (Ubuntu/Debian):
```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application ports (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 3001
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Enable firewall
sudo ufw enable
```

#### Docker Security

**Security Best Practices**:
```yaml
services:
  backend:
    image: todo-backend:latest
    user: node  # Non-root user
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - ./logs:/app/logs  # Only mount necessary directories
```

### Environment Security

#### Secret Management

**Environment Variables**:
```bash
# Use strong secrets
JWT_SECRET="$(openssl rand -hex 32)"
DB_PASSWORD="$(openssl rand -hex 16)"

# Never commit secrets to version control
# Use .env files that are gitignored
```

**Docker Secrets** (Swarm):
```yaml
version: '3.8'
services:
  backend:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

### Compliance Considerations

#### Data Privacy (GDPR/CCPA)

**Data Retention**:
```sql
-- Automatic cleanup of old logs
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM todo_event_logs
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs();');
```

**Data Export**:
```javascript
app.get('/api/user/data-export', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  // Export user's data
  const groups = await Group.find({ createdBy: userId });
  const tasks = await Task.find({ groupId: { $in: groups.map(g => g._id) } });

  res.json({
    user: req.user,
    groups,
    tasks,
    exportedAt: new Date()
  });
});
```

### Security Monitoring

#### Audit Logging

**Security Events**:
```javascript
const logSecurityEvent = (event, details) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'security',
    event,
    details,
    ip: details.ip,
    userAgent: details.userAgent
  }));
};

// Log failed login attempts
app.post('/auth/login', async (req, res) => {
  // ... login logic
  if (failed) {
    logSecurityEvent('failed_login', {
      username: req.body.username,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
});
```

#### Intrusion Detection

**Fail2Ban Configuration**:
```ini
# /etc/fail2ban/jail.local
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
```

---

## Backup and Recovery

### Database Backup Strategies

#### MongoDB Atlas Backups

**Automated Backups**:
```javascript
// MongoDB Atlas provides automatic backups
// Configure in Atlas dashboard:
// - Daily backups
// - Point-in-time recovery
// - Cross-region replication
```

**Manual Backup**:
```bash
# Using mongodump
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/todo_prod" \
  --out=/backups/$(date +%Y%m%d_%H%M%S)

# Using MongoDB Atlas API
curl -X POST \
  https://cloud.mongodb.com/api/atlas/v1.0/groups/{GROUP-ID}/clusters/{CLUSTER-NAME}/backup \
  -H "Authorization: Bearer {ACCESS-TOKEN}"
```

#### TimescaleDB Backup

**Continuous Archiving**:
```bash
# Enable WAL archiving
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

# Base backup
pg_basebackup -h timescaledb -U postgres -D /backups/base

# WAL backup
pg_receivewal -h timescaledb -U postgres -D /backups/wal
```

**Logical Backup**:
```sql
-- Create backup
pg_dump -h timescaledb -U postgres -d todo_history \
  --format=custom --compress=9 \
  --file=/backups/todo_history_$(date +%Y%m%d).backup

-- Restore backup
pg_restore -h timescaledb -U postgres \
  -d todo_history /backups/todo_history_20250101.backup
```

### Application Data Backup

#### Configuration Backup

```bash
# Backup environment files
tar -czf /backups/config_$(date +%Y%m%d).tar.gz \
  /opt/todo-backend/.env \
  /opt/todo-frontend/.env \
  /etc/nginx/sites-available/todo.conf

# Backup SSL certificates
tar -czf /backups/ssl_$(date +%Y%m%d).tar.gz \
  /etc/ssl/certs/ \
  /etc/ssl/private/
```

#### Log Backup

```bash
# Compress and archive logs
find /var/log/todo -name "*.log" -mtime +7 -exec gzip {} \;

# Backup compressed logs
tar -czf /backups/logs_$(date +%Y%m%d).tar.gz \
  /var/log/todo/*.gz
```

### Recovery Procedures

#### Complete System Recovery

**Step-by-Step Recovery**:
```bash
# 1. Restore infrastructure
terraform apply  # If using IaC

# 2. Restore databases
# MongoDB Atlas: Use Atlas backup restore
# TimescaleDB: Restore from backup
pg_restore -h timescaledb -U postgres \
  -d todo_history /backups/todo_history_latest.backup

# 3. Restore configuration
tar -xzf /backups/config_latest.tar.gz -C /

# 4. Deploy applications
cd /opt/todo-backend && npm install && pm2 start ecosystem.config.js
cd /opt/todo-frontend && npm run build

# 5. Restore SSL certificates
tar -xzf /backups/ssl_latest.tar.gz -C /

# 6. Restart services
sudo systemctl restart nginx
sudo systemctl restart todo-consumer

# 7. Verify system health
curl https://yourdomain.com/api/health
```

#### Point-in-Time Recovery

**TimescaleDB PITR**:
```bash
# Stop TimescaleDB
docker-compose stop timescaledb

# Restore base backup
pg_restore -h timescaledb -U postgres \
  --create --clean \
  /backups/base_20250101.backup

# Restore WAL files up to target time
pg_receivewal --recovery-target-time="2025-01-01 10:00:00"

# Start TimescaleDB
docker-compose start timescaledb
```

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)

- **Critical**: Database recovery - 4 hours
- **Important**: Application recovery - 2 hours
- **Standard**: Full system recovery - 8 hours

#### Recovery Point Objectives (RPO)

- **Critical Data**: MongoDB - 1 hour
- **Log Data**: TimescaleDB - 15 minutes
- **Configuration**: Git repository - Real-time

#### Multi-Region Setup

```yaml
# Multi-region Docker Swarm
version: '3.8'
services:
  timescaledb:
    deploy:
      placement:
        constraints:
          - node.labels.region == us-east-1
      replicas: 1

  timescaledb-replica:
    image: timescale/timescaledb:latest-pg16
    deploy:
      placement:
        constraints:
          - node.labels.region == us-west-2
      replicas: 1
    environment:
      POSTGRES_MASTER_HOST: timescaledb
```

### Backup Verification

#### Automated Testing

```bash
#!/bin/bash
# backup-verification.sh

BACKUP_FILE="/backups/todo_history_$(date +%Y%m%d).backup"
TEST_DB="todo_history_test"

# Create test database
createdb -h timescaledb -U postgres $TEST_DB

# Restore backup to test database
pg_restore -h timescaledb -U postgres -d $TEST_DB $BACKUP_FILE

# Run integrity checks
psql -h timescaledb -U postgres -d $TEST_DB -c "
  SELECT COUNT(*) as total_logs FROM todo_event_logs;
  SELECT event_type, COUNT(*) FROM todo_event_logs GROUP BY event_type;
"

# Clean up
dropdb -h timescaledb -U postgres $TEST_DB

echo "Backup verification completed successfully"
```

---

## Scaling and Performance Tuning

### Performance Monitoring

#### Key Metrics to Monitor

**Application Metrics**:
- Response time (p95, p99)
- Throughput (requests/second)
- Error rate (5xx responses)
- Database connection pool usage
- Memory/CPU usage per service

**Database Metrics**:
- Query execution time
- Connection count
- Lock waits
- Cache hit ratio
- Replication lag

**Kafka Metrics**:
- Producer/Consumer lag
- Message throughput
- Broker disk usage
- Partition distribution

### Backend Scaling

#### Horizontal Scaling with PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'todo-backend',
    script: 'index.js',
    instances: 'max',  // CPU core count
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

#### Load Balancing Configuration

```nginx
upstream backend_cluster {
    least_conn;
    server backend-1:3001 max_fails=3 fail_timeout=30s;
    server backend-2:3001 max_fails=3 fail_timeout=30s;
    server backend-3:3001 max_fails=3 fail_timeout=30s;
}

server {
    location /api/ {
        proxy_pass http://backend_cluster;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### Database Optimization

#### MongoDB Performance Tuning

**Indexing Strategy**:
```javascript
// Ensure indexes exist
db.groups.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "groupId": 1, "createdAt": -1 });
db.tasks.createIndex({ "status": 1, "updatedAt": -1 });
db.comments.createIndex({ "taskId": 1, "createdAt": -1 });

// Compound indexes for common queries
db.tasks.createIndex({
  "groupId": 1,
  "status": 1,
  "createdAt": -1
});
```

**Connection Pooling**:
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,      // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0    // Disable mongoose buffering
});
```

#### TimescaleDB Optimization

**Hypertable Chunk Configuration**:
```sql
-- Optimize chunk size for query patterns
SELECT set_chunk_time_interval('todo_event_logs', INTERVAL '1 day');

-- Add space partitioning for better performance
SELECT add_dimension('todo_event_logs', 'group_id', number_partitions => 4);

-- Compression for older data
ALTER TABLE todo_event_logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'group_id',
  timescaledb.compress_orderby = 'timestamp DESC'
);

-- Compress chunks older than 7 days
SELECT compress_chunk(c) FROM show_chunks('todo_event_logs', INTERVAL '7 days') c;
```

**Query Optimization**:
```sql
-- Create optimized indexes
CREATE INDEX idx_group_time ON todo_event_logs (group_id, timestamp DESC);
CREATE INDEX idx_task_time ON todo_event_logs (task_id, timestamp DESC);
CREATE INDEX idx_event_time ON todo_event_logs (event_type, timestamp DESC);

-- Use time_bucket for aggregations
SELECT
  time_bucket('1 hour', timestamp) as hour,
  event_type,
  count(*) as events
FROM todo_event_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour, event_type
ORDER BY hour DESC;
```

### Kafka Performance Tuning

#### Producer Optimization

```javascript
const producer = kafka.producer({
  allowAutoTopicCreation: false,
  transactionTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
    maxRetryTime: 30000
  },
  compression: CompressionTypes.GZIP,
  batch: {
    size: 16384,  // 16KB
    linger: 5     // 5ms
  }
});
```

#### Consumer Optimization

```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"kafka-1:9092", "kafka-2:9092"},
    Topic:          "todo-history-events",
    GroupID:        "todo-consumer-group-go",
    MinBytes:       1,
    MaxBytes:       10e6,    // 10MB
    CommitInterval: time.Second,
    StartOffset:    kafka.LastOffset,
    MaxWait:        time.Second,
    SessionTimeout: 10 * time.Second,
    HeartbeatInterval: 3 * time.Second,
})
```

#### Topic Configuration for Production

```bash
# Create topic with production settings
kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --topic todo-history-events \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --config segment.ms=86400000 \
  --config cleanup.policy=delete \
  --config compression.type=gzip
```

### Caching Strategies

#### Application-Level Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Cache group summaries
app.get('/api/logs/groups', async (req, res) => {
  const cacheKey = 'groups_summary';
  let summary = cache.get(cacheKey);

  if (!summary) {
    summary = await getGroupsSummaryFromDB();
    cache.set(cacheKey, summary);
  }

  res.json(summary);
});
```

#### Database Query Caching

```sql
-- Enable query caching in TimescaleDB
SET enable_seqscan = off;
SET work_mem = '64MB';

-- Create materialized view for expensive aggregations
CREATE MATERIALIZED VIEW daily_group_stats AS
SELECT
  group_id,
  date_trunc('day', timestamp) as day,
  count(*) as total_events,
  count(distinct task_id) as active_tasks
FROM todo_event_logs
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY group_id, date_trunc('day', timestamp);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_group_stats;
```

### Auto-Scaling Configuration

#### Container Auto-Scaling

```yaml
# docker-compose with auto-scaling
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

#### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Performance Benchmarks

#### Expected Performance

| Operation | Target Response Time | Target Throughput |
|-----------|---------------------|-------------------|
| Get groups | < 100ms | 1000 req/sec |
| Create task | < 200ms | 500 req/sec |
| Get logs | < 500ms | 200 req/sec |
| Event processing | < 100ms | 1000 events/sec |

#### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/groups

# Using Artillery
# artillery.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Get groups'
    requests:
      - get:
          url: '/api/groups'
```

---

## Maintenance and Updates

### Regular Maintenance Tasks

#### Database Maintenance

**MongoDB Maintenance**:
```javascript
// Run in MongoDB shell or through application
db.groups.reIndex();
db.tasks.reIndex();

// Monitor index usage
db.groups.aggregate([{$indexStats: {}}]);
```

**TimescaleDB Maintenance**:
```sql
-- Recompress chunks
SELECT compress_chunk(c) FROM show_chunks('todo_event_logs', INTERVAL '30 days') c;

-- Vacuum and analyze
VACUUM ANALYZE todo_event_logs;

-- Rebuild indexes if needed
REINDEX TABLE CONCURRENTLY todo_event_logs;
```

#### Application Maintenance

**Log Rotation**:
```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Nginx log rotation
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
```

### Update Procedures

#### Zero-Downtime Deployment

**Blue-Green Deployment**:
```bash
# 1. Deploy new version to blue environment
kubectl set image deployment/todo-backend-blue todo-backend=todo-backend:v2.0.0

# 2. Run health checks on blue
curl -f http://blue-environment/api/health

# 3. Switch traffic to blue
kubectl patch service todo-backend -p '{"spec":{"selector":{"version":"blue"}}}'

# 4. Keep green as rollback option
# 5. After successful deployment, update green to new version
```

**Rolling Update with Kubernetes**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: todo-backend
        image: todo-backend:v2.0.0
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 30
```

#### Backend Update Procedure

```bash
# 1. Create backup
pm2 save

# 2. Pull latest code
cd /opt/todo-backend
git pull origin main

# 3. Install dependencies
npm ci

# 4. Run tests
npm test

# 5. Build if needed
npm run build

# 6. Graceful restart
pm2 reload ecosystem.config.js

# 7. Verify health
curl http://localhost:3001/api/health

# 8. Monitor logs
pm2 logs --lines 50
```

#### Frontend Update Procedure

```bash
# 1. Pull latest code
cd /opt/todo-frontend
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run tests
npm test

# 4. Build production assets
npm run build

# 5. Backup current assets
cp -r /var/www/todo /var/www/todo.backup

# 6. Deploy new assets
cp -r dist/* /var/www/todo/

# 7. Test deployment
curl -I https://yourdomain.com

# 8. Clear CDN cache if applicable
# aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### Monitoring Post-Update

#### Automated Health Checks

```bash
#!/bin/bash
# post-deployment-check.sh

# Check backend health
if ! curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "Backend health check failed"
    exit 1
fi

# Check database connectivity
if ! psql -h timescaledb -U postgres -d todo_history -c "SELECT 1;" > /dev/null; then
    echo "Database connectivity check failed"
    exit 1
fi

# Check Kafka connectivity
if ! docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null; then
    echo "Kafka connectivity check failed"
    exit 1
fi

echo "All post-deployment checks passed"
```

#### Rollback Procedures

**Application Rollback**:
```bash
# PM2 rollback
pm2 rollback todo-backend

# Or redeploy previous version
pm2 stop todo-backend
pm2 delete todo-backend
pm2 start ecosystem.config.js --env production

# Verify rollback
curl http://localhost:3001/api/health
```

**Database Rollback**:
```sql
-- If schema changes, restore from backup
pg_restore -h timescaledb -U postgres \
  -d todo_history /backups/pre_update.backup

-- Or run migration rollback scripts
-- (Implement proper migration system)
```

### Security Updates

#### Automated Security Patching

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /opt/todo-backend
npm audit fix

# Update Go dependencies
cd /opt/go-consumer
go get -u ./...
go mod tidy

# Rebuild and redeploy
go build -o consumer .
sudo systemctl restart todo-consumer
```

#### Dependency Vulnerability Scanning

```bash
# NPM audit
cd /opt/todo-backend
npm audit
npm audit fix

# Go vulnerability check
cd /opt/go-consumer
go mod download
go list -json -m all | docker run --rm -i golang:1.22 go mod download && go list -m -f '{{if .Module}}{{.Module}}{{end}}' all
```

### Capacity Planning

#### Resource Monitoring

**Disk Usage Monitoring**:
```bash
# Monitor disk usage
df -h

# Database size monitoring
psql -h timescaledb -U postgres -d todo_history -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

**Performance Trending**:
```sql
-- Query performance over time
SELECT
  date_trunc('hour', timestamp) as hour,
  avg(extract(epoch from (updated_at - created_at))) as avg_response_time,
  count(*) as request_count
FROM request_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', timestamp)
ORDER BY hour DESC;
```

### Compliance and Audit

#### Audit Logging

**System Access Audit**:
```bash
# SSH access logging
# /etc/ssh/sshd_config
LogLevel VERBOSE
SyslogFacility AUTH

# Application audit logs
# Log all authentication events
logger -p auth.info "User $USER logged in from $SSH_CLIENT"
```

#### Compliance Checks

**Regular Compliance Audits**:
```bash
# Check file permissions
find /opt/todo -type f -exec ls -l {} \; | grep -v "rwx------"

# Check running processes
ps aux | grep -E "(node|go|nginx|postgres)"

# Verify SSL certificates
openssl x509 -in /etc/ssl/certs/yourdomain.crt -text -noout | grep -E "(Issuer|Not Before|Not After)"
```

---

## Troubleshooting for Production Issues

### Application Performance Issues

#### High Response Times

**Diagnosis**:
```bash
# Check PM2 process status
pm2 jlist

# Check system resources
top -p $(pgrep -f "node index.js")

# Check database slow queries
psql -h timescaledb -U postgres -d todo_history -c "
  SELECT query, calls, total_time, mean_time, rows
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

**Solutions**:
- Add database indexes
- Implement caching
- Scale horizontally
- Optimize queries

#### Memory Leaks

**Detection**:
```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect --expose-gc index.js
# In Chrome DevTools: Memory tab → Take heap snapshot
```

**Resolution**:
```javascript
// Implement proper cleanup
process.on('SIGTERM', () => {
  // Close database connections
  mongoose.connection.close();
  // Close Kafka connections
  kafkaProducer.disconnect();
  // Exit gracefully
  process.exit(0);
});
```

### Database Issues

#### Connection Pool Exhaustion

**Symptoms**:
- "Connection pool exhausted" errors
- Slow response times
- Database connection timeouts

**Resolution**:
```javascript
// Increase connection pool size
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
});
```

#### TimescaleDB Performance Issues

**Symptoms**:
- Slow log queries
- High CPU usage on database

**Resolution**:
```sql
-- Check chunk statistics
SELECT *
FROM chunk_relation_size('todo_event_logs')
ORDER BY total_size DESC;

-- Optimize chunk size
SELECT set_chunk_time_interval('todo_event_logs', INTERVAL '6 hours');

-- Add more partitions
SELECT add_dimension('todo_event_logs', 'group_id', number_partitions => 8);
```

### Kafka Issues

#### Consumer Lag

**Diagnosis**:
```bash
# Check consumer group lag
kafka-consumer-groups --bootstrap-server kafka:9092 \
  --describe --group todo-consumer-group-go

# Check consumer logs
pm2 logs go-consumer
```

**Resolution**:
```go
// Increase consumer parallelism
// Run multiple consumer instances
for i := 0; i < 3; i++ {
    go func(instance int) {
        consumer := createConsumer(instance)
        consumer.Start()
    }(i)
}
```

#### Producer Timeouts

**Symptoms**:
- Event publishing failures
- "Timeout" errors in logs

**Resolution**:
```javascript
// Increase timeouts and retries
const producer = kafka.producer({
  requestTimeout: 60000,
  retry: {
    retries: 10,
    initialRetryTime: 300,
    maxRetryTime: 30000
  }
});
```

### Infrastructure Issues

#### Load Balancer Problems

**Symptoms**:
- 502/503 errors
- Uneven load distribution

**Resolution**:
```nginx
# Health check configuration
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}

# Upstream configuration
upstream backend {
    least_conn;
    server backend-1:3001 max_fails=3 fail_timeout=30s;
    server backend-2:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

#### SSL Certificate Issues

**Symptoms**:
- SSL handshake failures
- Certificate expired warnings

**Resolution**:
```bash
# Renew Let's Encrypt certificate
certbot renew

# Check certificate validity
openssl x509 -in /etc/ssl/certs/yourdomain.crt -text | grep "Not After"

# Restart nginx
sudo systemctl reload nginx
```

### Monitoring and Alerting Issues

#### Alert Fatigue

**Problem**: Too many alerts, important ones get ignored

**Solution**:
```yaml
# Alert grouping and routing
groups:
  - name: database
    rules:
      - alert: DatabaseDown
        expr: up{job="timescaledb"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"

  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
```

#### Missing Metrics

**Problem**: Monitoring system not collecting required metrics

**Solution**:
```yaml
# Add missing scrape targets
scrape_configs:
  - job_name: 'todo-backend'
    static_configs:
      - targets: ['backend-1:3001', 'backend-2:3001', 'backend-3:3001']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

---

## Summary

This comprehensive documentation covers the complete Todo Application system from development setup to production deployment. The system features:

### ✅ **Completed Sections**

1. **System Overview** - Complete architecture and technology stack
2. **Complete Architecture** - Detailed diagrams and component relationships
3. **Prerequisites & System Requirements** - Hardware and software requirements
4. **Quick Start Guide** - Step-by-step setup instructions
5. **Docker Infrastructure** - Container configuration and management
6. **Apache Kafka Operations** - Message broker setup and operations
7. **Backend Server (Express.js)** - API server configuration and endpoints
8. **Frontend Application (React)** - UI application structure and features
9. **Go Kafka Consumer** - Event processing service
10. **Complete Data Flow** - End-to-end data processing
11. **Database Schemas** - MongoDB and TimescaleDB structures
12. **API Reference** - Complete REST API documentation
13. **Event System** - Event types and payload structures
14. **Monitoring & Debugging** - Health checks and troubleshooting tools
15. **Troubleshooting Guide** - Common issues and solutions
16. **Production Deployment** - Complete production setup guide
17. **Security Considerations** - Authentication, authorization, and data protection
18. **Backup and Recovery** - Database and application backup strategies
19. **Scaling and Performance Tuning** - Performance optimization and auto-scaling
20. **Maintenance and Updates** - Regular maintenance and update procedures
21. **Troubleshooting for Production Issues** - Production-specific problem resolution

### 🔧 **Key Technical Details Included**

- **Docker Compose** configuration with production settings
- **Environment variables** for all components
- **Database schemas** with indexing strategies
- **Kafka topic configuration** and performance tuning
- **Security implementations** including JWT and rate limiting
- **Monitoring setups** with Prometheus and Grafana
- **Backup procedures** for both databases
- **Scaling configurations** for horizontal scaling
- **SSL/TLS setup** with Let's Encrypt
- **Load balancing** with Nginx
- **CI/CD pipelines** and deployment strategies

### 📊 **Production Readiness Features**

- **Health checks** and monitoring endpoints
- **Logging and alerting** configurations
- **Security hardening** and compliance considerations
- **Disaster recovery** procedures
- **Performance benchmarks** and optimization
- **Automated maintenance** scripts
- **Zero-downtime deployment** strategies

### 🚀 **Next Steps for Production**

1. **Infrastructure Setup**
   - Provision cloud resources (AWS/GCP/Azure)
   - Configure load balancers and DNS
   - Set up monitoring and alerting

2. **Security Implementation**
   - Implement proper authentication (replace plain text passwords)
   - Configure SSL/TLS certificates
   - Set up firewalls and network security

3. **Database Migration**
   - Migrate from development to production databases
   - Set up automated backups
   - Configure replication and high availability

4. **Deployment Automation**
   - Set up CI/CD pipelines
   - Configure automated testing
   - Implement blue-green deployments

5. **Monitoring & Alerting**
   - Deploy ELK stack or similar
   - Configure alerting rules
   - Set up dashboards and reporting

This documentation provides everything needed to deploy and maintain the Todo Application system in production with enterprise-grade reliability, security, and performance.

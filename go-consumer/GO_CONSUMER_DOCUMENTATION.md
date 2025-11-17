# Go Kafka Consumer - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack & Versions](#technical-stack--versions)
3. [Project Structure](#project-structure)
4. [Prerequisites & Dependencies](#prerequisites--dependencies)
5. [Setup Instructions](#setup-instructions)
6. [Configuration](#configuration)
7. [Architecture Overview](#architecture-overview)
8. [Kafka Integration](#kafka-integration)
9. [Database Schema & Operations](#database-schema--operations)
10. [Event Processing Flow](#event-processing-flow)
11. [Data Models](#data-models)
12. [API Layer (Deprecated)](#api-layer-deprecated)
13. [Error Handling & Resilience](#error-handling--resilience)
14. [Logging & Monitoring](#logging--monitoring)
15. [Flow Diagrams](#flow-diagrams)
16. [Build & Deployment](#build--deployment)
17. [Development Guidelines](#development-guidelines)
18. [Troubleshooting](#troubleshooting)

---

## Project Overview

The Go Kafka Consumer is a high-performance event processing service that consumes todo application events from Apache Kafka and persists them to TimescaleDB for time-series analysis and historical tracking.

**Primary Responsibilities:**
- Consume events from Kafka topic `todo-history-events`
- Process event data and extract relationships
- Write structured event logs to TimescaleDB hypertable
- Provide database query functions for log retrieval

**Key Features:**
- Real-time event processing
- Time-series optimized storage (TimescaleDB)
- Automatic schema management
- Connection pooling for database
- Resilient error handling
- Continuous operation with retry logic

**Design Philosophy:**
- **Write-Only Service**: Focuses solely on consuming and persisting events
- **Separation of Concerns**: API layer handled by Express.js backend
- **High Performance**: Go's concurrency and efficiency for stream processing
- **Reliability**: Automatic reconnection and error recovery

---

## Technical Stack & Versions

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Go | 1.22 | Programming language |
| Apache Kafka | Latest | Event streaming platform |
| TimescaleDB | Latest | Time-series database (PostgreSQL extension) |
| PostgreSQL | Latest | Underlying database system |

### Go Dependencies

#### Direct Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| github.com/jackc/pgx/v5 | v5.5.5 | PostgreSQL/TimescaleDB driver & connection pooling |
| github.com/segmentio/kafka-go | v0.4.45 | Kafka client for Go |

#### Indirect Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| github.com/jackc/pgpassfile | v1.0.0 | PostgreSQL password file support |
| github.com/jackc/pgservicefile | v0.0.0-20221227161230 | PostgreSQL service file support |
| github.com/jackc/puddle/v2 | v2.2.1 | Connection pooling implementation |
| github.com/klauspost/compress | v1.15.9 | Compression algorithms for Kafka |
| github.com/pierrec/lz4/v4 | v4.1.15 | LZ4 compression for Kafka |
| golang.org/x/crypto | v0.17.0 | Cryptographic utilities |
| golang.org/x/sync | v0.1.0 | Synchronization primitives |
| golang.org/x/text | v0.14.0 | Text processing utilities |

### Build Output

- **Binary Name**: consumer.exe
- **Platform**: Windows x86-64
- **Type**: PE32+ Console Application
- **Size**: ~16.6 MB (includes runtime)

---

## Project Structure

```
go-consumer/
│
├── main.go                         # Application entry point
│                                   # - Service initialization
│                                   # - Database connection
│                                   # - Kafka consumer startup
│
├── go.mod                          # Go module definition
│                                   # - Module name: todo-consumer
│                                   # - Go version: 1.22
│                                   # - Dependencies list
│
├── go.sum                          # Dependency checksums
│                                   # - Version verification
│                                   # - Integrity checking
│
├── consumer.exe                    # Compiled Windows binary
│                                   # - Standalone executable
│                                   # - No external dependencies
│
├── kafka/
│   └── consumer.go                 # Kafka consumer implementation
│                                   # - Event consumption logic
│                                   # - Message processing
│                                   # - Event parsing & transformation
│
├── db/
│   └── timescale.go               # TimescaleDB operations
│                                   # - Database connection
│                                   # - Schema management
│                                   # - Event log insertion
│                                   # - Query functions (for Express.js)
│
└── api/
    └── server.go                   # DEPRECATED HTTP API server
                                    # - No longer used
                                    # - Kept for reference
                                    # - Replaced by Express.js API
```

### Directory Breakdown

#### `/` (Root)
- **main.go**: Entry point that orchestrates service startup
- **go.mod**: Module definition and dependency management
- **consumer.exe**: Production-ready compiled binary

#### `/kafka/`
- **consumer.go**: Kafka event consumption and processing logic
  - Reader configuration
  - Message unmarshaling
  - Entity relationship extraction
  - Database insertion coordination

#### `/db/`
- **timescale.go**: All database-related functionality
  - Connection pooling setup
  - Schema creation and verification
  - Hypertable configuration
  - Index management
  - Insert operations
  - Query functions for API layer

#### `/api/` (Deprecated)
- **server.go**: Former HTTP API implementation
  - No longer called from main.go
  - API functionality moved to Express.js
  - Kept for reference only

---

## Prerequisites & Dependencies

### System Requirements

#### Required Software

1. **Go 1.22 or higher**
   - Download: https://go.dev/dl/
   - Required for building from source
   - Not needed if using pre-compiled binary

2. **Apache Kafka**
   - Version: Latest stable
   - Required: Running Kafka broker on `localhost:9092`
   - Topic: `todo-history-events` must exist

3. **TimescaleDB / PostgreSQL**
   - Version: PostgreSQL 12+ with TimescaleDB extension
   - Required: Running on `localhost:5432`
   - Database: `todo_history` must exist
   - User: `postgres` / Password: `postgres`

#### Optional Software

- **Docker**: For running Kafka and TimescaleDB in containers
- **Git**: For version control and source management

### System Architecture Requirements

```
┌─────────────────────────────────────────────────────────┐
│                    System Overview                       │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Express.js      │────────>│  Apache Kafka    │
│  Backend         │  Publish│  localhost:9092  │
│  (Port 3001)     │  Events │                  │
└──────────────────┘         └────────┬─────────┘
                                      │
                                      │ Topic:
                                      │ todo-history-events
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Go Consumer     │
                             │  (This Service)  │
                             └────────┬─────────┘
                                      │
                                      │ Insert Logs
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  TimescaleDB     │
                             │  localhost:5432  │
                             │  DB: todo_history│
                             └────────┬─────────┘
                                      │
                                      │ Query Logs
                                      │
                             ┌────────▼─────────┐
                             │  Express.js      │
                             │  API Endpoints   │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Frontend        │
                             │  (React App)     │
                             └──────────────────┘
```

### Network Requirements

| Service | Host | Port | Protocol | Required |
|---------|------|------|----------|----------|
| Kafka Broker | localhost | 9092 | TCP | Yes |
| TimescaleDB | localhost | 5432 | TCP | Yes |
| Express.js Backend | localhost | 3001 | HTTP | No (indirect) |

---

## Setup Instructions

### Method 1: Using Pre-compiled Binary (Recommended)

#### Step 1: Verify Prerequisites

```bash
# Verify Kafka is running
netstat -an | findstr "9092"

# Verify TimescaleDB is running
netstat -an | findstr "5432"
```

#### Step 2: Ensure Database Exists

```sql
-- Connect to PostgreSQL
psql -U postgres -h localhost

-- Create database if not exists
CREATE DATABASE todo_history;

-- Enable TimescaleDB extension
\c todo_history
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

#### Step 3: Ensure Kafka Topic Exists

```bash
# List existing topics
kafka-topics --bootstrap-server localhost:9092 --list

# Create topic if not exists
kafka-topics --bootstrap-server localhost:9092 \
  --create \
  --topic todo-history-events \
  --partitions 1 \
  --replication-factor 1
```

#### Step 4: Run the Consumer

```bash
# Navigate to go-consumer directory
cd C:\Users\bdhayalesh\Desktop\KTern\kafka\go-consumer

# Run the compiled binary
.\consumer.exe
```

#### Expected Output

```
🚀 Starting Go Kafka Consumer Service
📋 Role: Consume Kafka events → Write to TimescaleDB
✅ Connected to TimescaleDB
🧩 TimescaleDB schema verified (todo_event_logs with group-task relationships ready)
📡 Connecting to Kafka broker...
🚀 Go Kafka Consumer started on topic: todo-history-events
```

---

### Method 2: Building from Source

#### Step 1: Install Go

Download and install Go 1.22 or higher from https://go.dev/dl/

Verify installation:
```bash
go version
```

#### Step 2: Clone/Navigate to Project

```bash
cd C:\Users\bdhayalesh\Desktop\KTern\kafka\go-consumer
```

#### Step 3: Install Dependencies

```bash
go mod download
```

This will download:
- github.com/jackc/pgx/v5 v5.5.5
- github.com/segmentio/kafka-go v0.4.45
- All indirect dependencies

#### Step 4: Build the Application

```bash
# Build for Windows
go build -o consumer.exe main.go

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o consumer main.go

# Build for macOS
GOOS=darwin GOARCH=amd64 go build -o consumer main.go
```

#### Step 5: Run the Application

```bash
# Windows
.\consumer.exe

# Linux/macOS
./consumer
```

---

### Method 3: Running with Docker (Future Enhancement)

Currently, no Dockerfile exists. To containerize:

**Recommended Dockerfile:**
```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o consumer main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/consumer .
CMD ["./consumer"]
```

**Docker Compose Integration:**
```yaml
version: '3.8'
services:
  go-consumer:
    build: ./go-consumer
    depends_on:
      - kafka
      - timescaledb
    environment:
      - KAFKA_BROKER=kafka:9092
      - TIMESCALE_URI=postgres://postgres:postgres@timescaledb:5432/todo_history
    restart: unless-stopped
```

---

## Configuration

### Current Configuration Approach

**Status**: All configuration is **hardcoded** in source files. No external configuration files exist.

### Hardcoded Values

#### Kafka Configuration

**Location**: [kafka/consumer.go:35-38](kafka/consumer.go#L35-L38)

```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "todo-history-events",
    GroupID: "todo-consumer-group-go",
})
```

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Brokers | `localhost:9092` | Kafka broker address |
| Topic | `todo-history-events` | Topic to consume from |
| GroupID | `todo-consumer-group-go` | Consumer group identifier |

#### TimescaleDB Configuration

**Location**: [main.go:28](main.go#L28)

```go
timescaleURI := "postgres://postgres:postgres@localhost:5432/todo_history"
```

**URI Components:**
```
postgres://[username]:[password]@[host]:[port]/[database]
```

| Component | Value | Description |
|-----------|-------|-------------|
| Username | `postgres` | Database user |
| Password | `postgres` | User password |
| Host | `localhost` | Database server |
| Port | `5432` | PostgreSQL port |
| Database | `todo_history` | Database name |

#### API Configuration (Deprecated)

**Location**: [api/server.go:49](api/server.go#L49)

```go
http.ListenAndServe(":7250", nil)
```

| Parameter | Value | Note |
|-----------|-------|------|
| Port | `7250` | Not used (API deprecated) |

### Environment Variable Support (Recommended Enhancement)

The service currently does **NOT** support environment variables. To add support:

**Recommended `.env` format:**
```env
# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=todo-history-events
KAFKA_GROUP_ID=todo-consumer-group-go

# TimescaleDB Configuration
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5432
TIMESCALE_USER=postgres
TIMESCALE_PASSWORD=postgres
TIMESCALE_DATABASE=todo_history

# Optional Configuration
LOG_LEVEL=info
ENABLE_METRICS=false
```

### Configuration Best Practices

1. **Development**: Use localhost values (current approach)
2. **Staging/Production**:
   - Use environment variables
   - Use Docker secrets
   - Use configuration management tools (Consul, etcd)
3. **Security**:
   - Never commit credentials to version control
   - Use strong passwords
   - Enable SSL/TLS for production
   - Use authentication tokens

---

## Architecture Overview

### System Architecture

The Go consumer is part of a larger event-driven architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                     TODO APPLICATION ECOSYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   Frontend       │
│   React App      │  User Interactions
│   Port 5173      │
└────────┬─────────┘
         │
         │ HTTP API Calls
         │
         ▼
┌──────────────────────────────────────────────┐
│         Express.js Backend (Port 3001)       │
│                                              │
│  ┌────────────┐  ┌──────────────┐           │
│  │ REST API   │  │ PostgreSQL   │           │
│  │ Endpoints  │  │ (Main DB)    │           │
│  └─────┬──────┘  └──────────────┘           │
│        │                                     │
│        │ Publish Events                      │
│        ▼                                     │
│  ┌────────────┐                              │
│  │  Kafka     │                              │
│  │  Producer  │                              │
│  └─────┬──────┘                              │
└────────┼────────────────────────────────────┘
         │
         │ Kafka Messages
         │
         ▼
┌──────────────────┐
│  Apache Kafka    │
│  localhost:9092  │
│                  │
│  Topic:          │
│  todo-history-   │
│  events          │
└────────┬─────────┘
         │
         │ Consume Messages
         │
         ▼
┌────────────────────────────────────────────┐
│     Go Kafka Consumer (This Service)       │
│                                            │
│  ┌──────────────┐                          │
│  │   Kafka      │  Read Events             │
│  │   Reader     │                          │
│  └──────┬───────┘                          │
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │   Event      │  Parse & Transform       │
│  │   Processor  │                          │
│  └──────┬───────┘                          │
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │   Database   │  Insert Logs             │
│  │   Writer     │                          │
│  └──────┬───────┘                          │
└─────────┼────────────────────────────────┘
          │
          │ SQL INSERT
          │
          ▼
┌──────────────────┐
│  TimescaleDB     │
│  localhost:5432  │
│                  │
│  Database:       │
│  todo_history    │
│                  │
│  Table:          │
│  todo_event_logs │
│  (Hypertable)    │
└────────┬─────────┘
         │
         │ SQL SELECT
         │
         ▼
┌──────────────────┐
│  Express.js      │
│  Logs API        │
│  /api/logs/*     │
└────────┬─────────┘
         │
         │ HTTP Response
         │
         ▼
┌──────────────────┐
│   Frontend       │
│   (Display Logs) │
└──────────────────┘
```

### Service Role & Responsibilities

#### Primary Role: **Event Persister**

The Go consumer acts as a dedicated write service that:

1. **Consumes** events from Kafka topic
2. **Processes** event data to extract relationships
3. **Persists** structured logs to TimescaleDB
4. **Ensures** data integrity and consistency

#### What This Service Does

- Real-time event consumption from Kafka
- JSON deserialization of event payloads
- Timestamp parsing and normalization
- Entity relationship extraction (Group ↔ Task)
- Database connection pooling
- Automatic schema management
- Continuous operation with error recovery
- Console logging of processed events

#### What This Service Does NOT Do

- Does NOT expose HTTP API (moved to Express.js)
- Does NOT query logs (Express.js handles reads)
- Does NOT modify existing logs
- Does NOT interact with frontend directly
- Does NOT manage Kafka topics
- Does NOT handle user authentication

### Design Patterns

#### 1. Write-Read Segregation

```
┌─────────────────────┐         ┌─────────────────────┐
│   Go Consumer       │         │   Express.js API    │
│   (Write Service)   │         │   (Read Service)    │
│                     │         │                     │
│   - Write to DB     │         │   - Read from DB    │
│   - No API exposed  │         │   - HTTP Endpoints  │
│   - High throughput │         │   - Query optimization│
└─────────────────────┘         └─────────────────────┘
```

**Benefits:**
- Optimized for different workloads
- Scalable independently
- Simpler codebase per service

#### 2. Single Responsibility Principle

Each package has one clear purpose:
- `main`: Service orchestration
- `kafka`: Event consumption
- `db`: Data persistence

#### 3. Connection Pooling

```go
var Pool *pgxpool.Pool  // Global connection pool

Pool, err = pgxpool.New(context.Background(), uri)
```

**Benefits:**
- Efficient resource usage
- Automatic connection recycling
- Better performance under load

#### 4. Continuous Processing Loop

```go
for {
    message := reader.ReadMessage()
    processEvent(message)
}
```

**Benefits:**
- Always available for new events
- Self-healing on errors
- Stateless processing

---

## Kafka Integration

### Kafka Client Configuration

**Library**: `github.com/segmentio/kafka-go v0.4.45`

**File**: [kafka/consumer.go](kafka/consumer.go)

### Consumer Configuration

```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "todo-history-events",
    GroupID: "todo-consumer-group-go",
})
```

### Configuration Parameters Explained

| Parameter | Value | Purpose | Default Behavior |
|-----------|-------|---------|------------------|
| **Brokers** | `["localhost:9092"]` | Kafka broker addresses | Required, no default |
| **Topic** | `"todo-history-events"` | Topic to subscribe to | Required, no default |
| **GroupID** | `"todo-consumer-group-go"` | Consumer group ID | Enables consumer groups |

### Consumer Group Behavior

**Group ID**: `todo-consumer-group-go`

**Benefits:**
- **Load Balancing**: Multiple consumers can share the load
- **Offset Management**: Kafka tracks consumption progress
- **Fault Tolerance**: Another consumer can take over if one fails
- **Scalability**: Add more consumers to process faster

**Current Setup:**
- Single consumer instance
- Can scale to multiple instances if needed
- Each instance would process different partitions

### Message Consumption Flow

```
┌─────────────────────────────────────────────┐
│         Kafka Topic: todo-history-events    │
│                                             │
│   Partition 0: [Msg1] [Msg2] [Msg3] ...    │
└──────────────────┬──────────────────────────┘
                   │
                   │ ReadMessage()
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Go Kafka Consumer                  │
│                                             │
│  1. reader.ReadMessage(ctx)                 │
│     - Blocking call                         │
│     - Returns when message available        │
│                                             │
│  2. json.Unmarshal(message.Value, &event)   │
│     - Parse JSON payload                    │
│     - Extract event structure               │
│                                             │
│  3. Process Event                           │
│     - Parse timestamp                       │
│     - Extract relationships                 │
│     - Transform data                        │
│                                             │
│  4. db.InsertLog(...)                       │
│     - Write to TimescaleDB                  │
│                                             │
│  5. Log to Console                          │
│     - Display processed event               │
│                                             │
│  6. Loop back to step 1                     │
└─────────────────────────────────────────────┘
```

### Event Message Format

**Producer**: Express.js backend

**Message Structure**:
```json
{
  "eventType": "created | updated | deleted | status_changed | commented",
  "timestamp": "2025-11-10T15:30:45.123Z",
  "payload": {
    "entity": "Group | Task",
    "entityId": "uuid-string",
    "groupId": "group-uuid",
    "groupName": "Group Name",
    "taskId": "task-uuid",
    "taskName": "Task Name",
    "changes": "Human-readable description",
    "user": "username",
    "workspace": "workspace-name",
    "timestamp": "2025-11-10T15:30:45.123Z"
  }
}
```

### Event Types

| Event Type | Description | Triggered By |
|------------|-------------|--------------|
| `created` | New entity created | POST /groups, POST /tasks |
| `updated` | Entity modified | PUT /groups/:id, PUT /tasks/:id |
| `deleted` | Entity removed | DELETE /groups/:id, DELETE /tasks/:id |
| `status_changed` | Task status updated | PUT /tasks/:id/status |
| `commented` | Comment added to task | POST /tasks/:id/comments |

### Consumer Offset Management

**Automatic Offset Commit:**
- Kafka automatically commits offsets after successful processing
- Default behavior with consumer groups
- No manual offset management required

**At-Least-Once Delivery:**
- Messages may be reprocessed on failure
- Database inserts are idempotent by nature (new row each time)
- No duplicate prevention needed for event logs

### Error Handling

```go
m, err := reader.ReadMessage(context.Background())
if err != nil {
    fmt.Printf("❌ Read error: %v\n", err)
    time.Sleep(2 * time.Second)  // Wait before retry
    continue                      // Skip this iteration
}
```

**Retry Strategy:**
- 2-second delay on Kafka read errors
- Infinite retry (never crash)
- Continues processing other messages

### Connection Management

**Connection Lifecycle:**
1. Reader created on service start
2. Connection maintained indefinitely
3. Automatic reconnection on network issues
4. No explicit connection closing (runs until killed)

### Performance Characteristics

**Throughput:**
- Single-threaded processing
- Processes one message at a time
- Database is the bottleneck, not Kafka

**Latency:**
- Blocking reads (waits for messages)
- Near real-time processing (milliseconds)
- Database insert adds ~10-50ms

**Scalability:**
- Can run multiple instances with same GroupID
- Each instance processes different partitions
- Linear scalability up to partition count

---

## Database Schema & Operations

### Database Technology

**Database**: TimescaleDB (PostgreSQL extension)
**Driver**: pgx/v5 (PostgreSQL driver for Go)
**Connection**: Connection pooling via pgxpool

### Connection Setup

**File**: [db/timescale.go](db/timescale.go)

```go
var Pool *pgxpool.Pool

func Init(uri string) error {
    Pool, err = pgxpool.New(context.Background(), uri)
    if err != nil {
        return fmt.Errorf("TimescaleDB connection error: %w", err)
    }
    fmt.Println("✅ Connected to TimescaleDB")

    if err := ensureSchema(); err != nil {
        return fmt.Errorf("failed to ensure schema: %w", err)
    }
    return nil
}
```

**Connection URI Format:**
```
postgres://username:password@host:port/database
```

**Example:**
```
postgres://postgres:postgres@localhost:5432/todo_history
```

### Connection Pooling

**Benefits:**
- Reuses database connections
- Reduces connection overhead
- Better performance under load
- Automatic connection management

**Default Pool Settings:**
- Max connections: Determined by pgxpool defaults
- Min connections: Determined by pgxpool defaults
- Connection timeout: 5 seconds (for schema operations)

### Database Schema

#### Table: `todo_event_logs`

**Table Type**: TimescaleDB Hypertable (time-series optimized)

**Schema Definition**:

```sql
CREATE TABLE IF NOT EXISTS todo_event_logs (
  id SERIAL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,

  -- Group and Task relationship fields
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
```

#### Column Details

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | SERIAL | No | Auto-incrementing identifier |
| **timestamp** | TIMESTAMPTZ | No | Event occurrence time (UTC) |
| **event_type** | VARCHAR(50) | No | Type of event (created, updated, etc.) |
| **entity** | VARCHAR(50) | No | Entity type (Group or Task) |
| **entity_id** | VARCHAR(100) | No | UUID of the affected entity |
| **group_id** | VARCHAR(100) | Yes | Associated group UUID |
| **group_name** | VARCHAR(255) | Yes | Group name (denormalized) |
| **task_id** | VARCHAR(100) | Yes | Associated task UUID (if applicable) |
| **task_name** | VARCHAR(255) | Yes | Task name (denormalized) |
| **changes** | TEXT | Yes | Human-readable change description |
| **user_name** | VARCHAR(100) | Yes | User who performed the action |
| **workspace** | VARCHAR(100) | Yes | Workspace context |
| **event_data** | JSONB | Yes | Additional event data (currently unused) |

#### Primary Key

```sql
PRIMARY KEY (timestamp, id)
```

**Composite Key Benefits:**
- Optimized for time-series queries
- Ensures uniqueness
- Required for TimescaleDB hypertable

### TimescaleDB Hypertable Configuration

```sql
SELECT create_hypertable('todo_event_logs', 'timestamp',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);
```

**Hypertable Configuration:**
- **Partitioning Column**: `timestamp`
- **Chunk Interval**: 1 day
- **Benefit**: Automatic partitioning by time
- **Query Optimization**: Time-range queries are faster

**How Hypertables Work:**
```
┌────────────────────────────────────────────┐
│         todo_event_logs (Hypertable)       │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌───────┐  ┌───────┐  ┌───────┐
    │Chunk 1│  │Chunk 2│  │Chunk 3│
    │Day 1  │  │Day 2  │  │Day 3  │
    └───────┘  └───────┘  └───────┘
```

### Database Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_event_type
  ON todo_event_logs (event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_group_id
  ON todo_event_logs (group_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_task_id
  ON todo_event_logs (task_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_entity
  ON todo_event_logs (entity, entity_id, timestamp DESC);
```

#### Index Details

| Index Name | Columns | Purpose | Used By |
|------------|---------|---------|---------|
| **idx_event_type** | event_type, timestamp DESC | Filter by event type | Analytics queries |
| **idx_group_id** | group_id, timestamp DESC | Retrieve group logs | GetGroupLogs() |
| **idx_task_id** | task_id, timestamp DESC | Retrieve task logs | GetTaskLogs() |
| **idx_entity** | entity, entity_id, timestamp DESC | Entity-specific queries | General lookups |

**Index Strategy:**
- All indexes include `timestamp DESC`
- Optimized for recent-first queries
- Covering indexes for common query patterns

### Database Operations

#### 1. InsertLog

**Purpose**: Insert a new event log entry

**Function Signature**:
```go
func InsertLog(
    eventType, entity, entityId,
    groupId, groupName, taskId, taskName,
    changes, user, workspace string,
    timestamp time.Time
) error
```

**SQL Query**:
```sql
INSERT INTO todo_event_logs (
    event_type, entity, entity_id,
    group_id, group_name, task_id, task_name,
    changes, user_name, workspace, timestamp
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
```

**Usage**:
```go
err := db.InsertLog(
    "created",
    "Task",
    "task-uuid-123",
    "group-uuid-456",
    "Project Alpha",
    "task-uuid-123",
    "Implement login",
    "Task 'Implement login' was created",
    "john_doe",
    "default",
    time.Now().UTC(),
)
```

#### 2. GetGroupLogs

**Purpose**: Retrieve all logs for a specific group (including tasks)

**Function Signature**:
```go
func GetGroupLogs(groupId string) ([]map[string]interface{}, error)
```

**SQL Query**:
```sql
SELECT
    id, timestamp, event_type, entity, entity_id,
    group_id, group_name, task_id, task_name,
    changes, user_name, workspace
FROM todo_event_logs
WHERE group_id = $1
ORDER BY timestamp DESC
LIMIT 100
```

**Returns**:
```json
[
  {
    "id": 123,
    "timestamp": "2025-11-10T15:30:45Z",
    "eventType": "created",
    "entity": "Task",
    "entityId": "task-uuid",
    "groupId": "group-uuid",
    "groupName": "Project Alpha",
    "taskId": "task-uuid",
    "taskName": "Implement login",
    "changes": "Task created",
    "user": "john_doe",
    "workspace": "default"
  }
]
```

**Usage**: Called by Express.js API endpoint `/api/logs/group/:groupId`

#### 3. GetTaskLogs

**Purpose**: Retrieve all logs for a specific task

**Function Signature**:
```go
func GetTaskLogs(taskId string) ([]map[string]interface{}, error)
```

**SQL Query**:
```sql
SELECT
    id, timestamp, event_type, entity, entity_id,
    group_id, group_name, task_id, task_name,
    changes, user_name, workspace
FROM todo_event_logs
WHERE task_id = $1
ORDER BY timestamp DESC
LIMIT 100
```

**Usage**: Called by Express.js API endpoint `/api/logs/task/:taskId`

#### 4. GetGroupsSummary

**Purpose**: Get aggregated statistics for all groups

**Function Signature**:
```go
func GetGroupsSummary() ([]map[string]interface{}, error)
```

**SQL Query**:
```sql
SELECT
    group_id,
    group_name,
    COUNT(*) as log_count,
    MAX(timestamp) as last_activity
FROM todo_event_logs
WHERE group_id IS NOT NULL
GROUP BY group_id, group_name
ORDER BY last_activity DESC
```

**Returns**:
```json
[
  {
    "groupId": "group-uuid-1",
    "groupName": "Project Alpha",
    "logCount": 45,
    "lastActivity": "2025-11-10T15:30:45Z"
  }
]
```

**Usage**: Called by Express.js API endpoint `/api/logs/groups`

#### 5. GetGroupTasksSummary

**Purpose**: Get aggregated statistics for tasks in a group

**Function Signature**:
```go
func GetGroupTasksSummary(groupId string) ([]map[string]interface{}, error)
```

**SQL Query**:
```sql
SELECT
    task_id,
    task_name,
    COUNT(*) as log_count,
    MAX(timestamp) as last_activity
FROM todo_event_logs
WHERE group_id = $1 AND task_id IS NOT NULL
GROUP BY task_id, task_name
ORDER BY last_activity DESC
```

**Returns**:
```json
[
  {
    "taskId": "task-uuid-1",
    "taskName": "Implement login",
    "logCount": 12,
    "lastActivity": "2025-11-10T15:30:45Z"
  }
]
```

**Usage**: Called by Express.js API endpoint `/api/logs/group/:groupId/tasks`

### Data Denormalization

**Strategy**: Store group_name and task_name alongside IDs

**Benefits:**
- Faster queries (no joins needed)
- Historical accuracy (name at event time)
- Simpler query logic

**Trade-offs:**
- Redundant data storage
- Names may become outdated
- Requires more storage space

**Justification**: For event logs, historical accuracy is more important than real-time data consistency

---

## Event Processing Flow

### Complete Processing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT PROCESSING FLOW                     │
└─────────────────────────────────────────────────────────────┘

Step 1: Kafka Message Arrival
───────────────────────────────
Kafka Topic: todo-history-events
         │
         │ Message received
         │
         ▼

Step 2: Message Read
────────────────────
reader.ReadMessage(context.Background())
         │
         ├─ Success ──────────────────┐
         │                            │
         └─ Error ────> Log Error     │
                        Sleep 2s      │
                        Retry         │
                                      │
                                      ▼

Step 3: JSON Deserialization
─────────────────────────────
json.Unmarshal(message.Value, &event)
         │
         ├─ Success ──────────────────┐
         │                            │
         └─ Parse Error ──> Log Error │
                            Skip Msg  │
                                      │
                                      ▼

Step 4: Timestamp Parsing
──────────────────────────
time.Parse(RFC3339, event.Timestamp)
         │
         ├─ Success ────> Use parsed time
         │                      │
         └─ Parse Error ──> time.Now().UTC()
                                │
                                │
                                ▼

Step 5: Entity Relationship Extraction
───────────────────────────────────────
Extract from payload:
- groupId, groupName
- taskId, taskName

Logic:
- If entity == "Group" → groupId = entityId
- If entity == "Task" → taskId = entityId
         │
         ▼

Step 6: Database Insertion
───────────────────────────
db.InsertLog(eventType, entity, entityId, ...)
         │
         ├─ Success ──────────────────┐
         │                            │
         └─ DB Error ────> Log Error  │
                           Skip Msg   │
                                      │
                                      ▼

Step 7: Console Logging
────────────────────────
Print formatted message:
"📝 [EventType] HH:MM:SS - Changes (Group: X, Task: Y)"
         │
         ▼

Step 8: Loop Back
─────────────────
Return to Step 1 (infinite loop)
```

### Detailed Processing Steps

#### Step 1: Kafka Message Read

**Code**:
```go
m, err := reader.ReadMessage(context.Background())
```

**Behavior**:
- **Blocking**: Waits until message available
- **Context**: Background context (no timeout)
- **Returns**: Message struct with Value (bytes)

**Error Handling**:
```go
if err != nil {
    fmt.Printf("❌ Read error: %v\n", err)
    time.Sleep(2 * time.Second)
    continue
}
```

#### Step 2: JSON Unmarshaling

**Code**:
```go
var e Event
if err := json.Unmarshal(m.Value, &e); err != nil {
    fmt.Printf("⚠️ JSON parse error: %v\n", err)
    continue
}
```

**Event Structure**:
```go
type Event struct {
    EventType string  `json:"eventType"`
    Payload   Payload `json:"payload"`
    Timestamp string  `json:"timestamp"`
}

type Payload struct {
    Entity    string `json:"entity"`
    EntityId  string `json:"entityId"`
    GroupId   string `json:"groupId,omitempty"`
    GroupName string `json:"groupName,omitempty"`
    TaskId    string `json:"taskId,omitempty"`
    TaskName  string `json:"taskName,omitempty"`
    Changes   string `json:"changes"`
    User      string `json:"user"`
    Workspace string `json:"workspace"`
    Timestamp string `json:"timestamp"`
}
```

#### Step 3: Timestamp Normalization

**Code**:
```go
ts, err := time.Parse(time.RFC3339, e.Timestamp)
if err != nil {
    ts = time.Now().UTC()
}
```

**Format**: RFC3339 (ISO 8601)
- Example: `2025-11-10T15:30:45.123Z`
- Timezone: Always UTC

**Fallback**: Current time if parsing fails

#### Step 4: Entity Relationship Mapping

**Code**:
```go
groupId := e.Payload.GroupId
groupName := e.Payload.GroupName
taskId := e.Payload.TaskId
taskName := e.Payload.TaskName

if e.Payload.Entity == "Group" {
    groupId = e.Payload.EntityId
}

if e.Payload.Entity == "Task" {
    taskId = e.Payload.EntityId
}
```

**Logic Table**:

| Entity | EntityId | groupId Source | taskId Source |
|--------|----------|----------------|---------------|
| Group | group-123 | entityId | payload.taskId |
| Task | task-456 | payload.groupId | entityId |

#### Step 5: Database Persistence

**Code**:
```go
if err := db.InsertLog(
    e.EventType,
    e.Payload.Entity,
    e.Payload.EntityId,
    groupId,
    groupName,
    taskId,
    taskName,
    e.Payload.Changes,
    e.Payload.User,
    e.Payload.Workspace,
    ts,
); err != nil {
    fmt.Printf("❌ DB insert error: %v\n", err)
    continue
}
```

**Transaction**: Each insert is a separate transaction

#### Step 6: Console Output

**Code**:
```go
var displayMsg string
if e.Payload.Changes != "" {
    displayMsg = e.Payload.Changes
} else {
    displayMsg = fmt.Sprintf("%s operation on %s", e.EventType, e.Payload.Entity)
}

fmt.Printf("📝 [%s] %s - %s (Group: %s, Task: %s)\n",
    e.EventType,
    ts.Format("15:04:05"),
    displayMsg,
    groupName,
    taskName,
)
```

**Example Output**:
```
📝 [created] 15:30:45 - Task 'Implement login' was created (Group: Project Alpha, Task: Implement login)
📝 [status_changed] 15:31:20 - Status changed to in-progress (Group: Project Alpha, Task: Implement login)
```

### Processing Characteristics

**Throughput**:
- Single-threaded processing
- ~100-1000 events/second (depending on DB)
- Sequential processing (one at a time)

**Latency**:
- Near real-time (< 100ms per event)
- Database insert is the slowest step
- No batching (each event inserted immediately)

**Reliability**:
- At-least-once processing
- Events may be reprocessed on failure
- No duplicate detection
- Infinite retry on errors

---

## Data Models

### Event Structure

#### Complete Event JSON Example

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
    "taskName": "Implement user authentication",
    "changes": "Task 'Implement user authentication' was created",
    "user": "john_doe",
    "workspace": "default",
    "timestamp": "2025-11-10T15:30:45.123Z"
  }
}
```

### Go Struct Definitions

#### Event Struct

```go
type Event struct {
    EventType string  `json:"eventType"`  // Type of event
    Payload   Payload `json:"payload"`    // Event details
    Timestamp string  `json:"timestamp"`  // ISO 8601 timestamp
}
```

**Field Details**:

| Field | Type | JSON Tag | Description | Example |
|-------|------|----------|-------------|---------|
| EventType | string | eventType | Event type identifier | "created" |
| Payload | Payload | payload | Event data | See below |
| Timestamp | string | timestamp | Event time (ISO 8601) | "2025-11-10T15:30:45Z" |

#### Payload Struct

```go
type Payload struct {
    Entity    string `json:"entity"`              // "Group" or "Task"
    EntityId  string `json:"entityId"`            // UUID of entity
    GroupId   string `json:"groupId,omitempty"`   // Group UUID
    GroupName string `json:"groupName,omitempty"` // Group name
    TaskId    string `json:"taskId,omitempty"`    // Task UUID
    TaskName  string `json:"taskName,omitempty"`  // Task name
    Changes   string `json:"changes"`             // Human description
    User      string `json:"user"`                // Username
    Workspace string `json:"workspace"`           // Workspace name
    Timestamp string `json:"timestamp"`           // Duplicate timestamp
}
```

**Field Details**:

| Field | Type | Optional | Description | Example |
|-------|------|----------|-------------|---------|
| Entity | string | No | Entity type | "Group" or "Task" |
| EntityId | string | No | UUID of affected entity | "f47ac10b-..." |
| GroupId | string | Yes | Associated group UUID | "a1b2c3d4-..." |
| GroupName | string | Yes | Group name (denormalized) | "Project Alpha" |
| TaskId | string | Yes | Associated task UUID | "f47ac10b-..." |
| TaskName | string | Yes | Task name (denormalized) | "Implement login" |
| Changes | string | No | Human-readable description | "Task created" |
| User | string | No | User who triggered event | "john_doe" |
| Workspace | string | No | Workspace context | "default" |
| Timestamp | string | No | Event timestamp (duplicate) | "2025-11-10T..." |

### Event Types Reference

| Event Type | Triggered By | Entity | Example Changes |
|------------|--------------|--------|-----------------|
| **created** | Entity creation | Group/Task | "Group 'Project Alpha' was created" |
| **updated** | Entity modification | Group/Task | "Group name changed to 'Project Beta'" |
| **deleted** | Entity deletion | Group/Task | "Task 'Old Task' was deleted" |
| **status_changed** | Task status update | Task | "Status changed to in-progress" |
| **commented** | Comment added | Task | "Comment added by john_doe" |

### Database Model

#### todo_event_logs Table Model

```go
// Not explicitly defined as a Go struct
// Represented as map[string]interface{} in query results
```

**Field Mapping**:

| Database Column | Go Variable | Type | Purpose |
|-----------------|-------------|------|---------|
| id | id | int | Auto-increment ID |
| timestamp | timestamp | time.Time | Event timestamp (UTC) |
| event_type | eventType | string | Event type |
| entity | entity | string | Entity type |
| entity_id | entityId | string | Entity UUID |
| group_id | groupId | *string | Group UUID (nullable) |
| group_name | groupName | *string | Group name (nullable) |
| task_id | taskId | *string | Task UUID (nullable) |
| task_name | taskName | *string | Task name (nullable) |
| changes | changes | *string | Description (nullable) |
| user_name | user | *string | Username (nullable) |
| workspace | workspace | *string | Workspace (nullable) |
| event_data | - | JSONB | Unused (nullable) |

### Example Event Scenarios

#### Scenario 1: Group Created

**Kafka Message**:
```json
{
  "eventType": "created",
  "timestamp": "2025-11-10T10:00:00Z",
  "payload": {
    "entity": "Group",
    "entityId": "group-uuid-1",
    "groupId": "group-uuid-1",
    "groupName": "Project Alpha",
    "taskId": null,
    "taskName": null,
    "changes": "Group 'Project Alpha' was created",
    "user": "alice",
    "workspace": "default",
    "timestamp": "2025-11-10T10:00:00Z"
  }
}
```

**Database Row**:
```sql
id: 1
timestamp: 2025-11-10 10:00:00+00
event_type: 'created'
entity: 'Group'
entity_id: 'group-uuid-1'
group_id: 'group-uuid-1'
group_name: 'Project Alpha'
task_id: NULL
task_name: NULL
changes: "Group 'Project Alpha' was created"
user_name: 'alice'
workspace: 'default'
```

#### Scenario 2: Task Status Changed

**Kafka Message**:
```json
{
  "eventType": "status_changed",
  "timestamp": "2025-11-10T11:30:00Z",
  "payload": {
    "entity": "Task",
    "entityId": "task-uuid-5",
    "groupId": "group-uuid-1",
    "groupName": "Project Alpha",
    "taskId": "task-uuid-5",
    "taskName": "Fix bug #42",
    "changes": "Status changed from pending to in-progress",
    "user": "bob",
    "workspace": "default",
    "timestamp": "2025-11-10T11:30:00Z"
  }
}
```

**Database Row**:
```sql
id: 15
timestamp: 2025-11-10 11:30:00+00
event_type: 'status_changed'
entity: 'Task'
entity_id: 'task-uuid-5'
group_id: 'group-uuid-1'
group_name: 'Project Alpha'
task_id: 'task-uuid-5'
task_name: 'Fix bug #42'
changes: 'Status changed from pending to in-progress'
user_name: 'bob'
workspace: 'default'
```

---

## API Layer (Deprecated)

### Current Status

**Status**: DEPRECATED - No longer used
**File**: [api/server.go](api/server.go)
**Reason**: API functionality migrated to Express.js backend

### Migration Details

**Former Port**: 7250 (Go service)
**New Port**: 3001 (Express.js service)

**Migration Date**: Moved to Express.js in recent refactoring

### Why API Was Deprecated

**Original Design**:
```
Frontend → Go API (Port 7250) → TimescaleDB
```

**New Design**:
```
Frontend → Express.js API (Port 3001) → TimescaleDB
```

**Benefits of Migration**:
1. **Single API Surface**: All APIs in one place (Express.js)
2. **Simplified Architecture**: Fewer services to maintain
3. **Easier Development**: JavaScript/TypeScript ecosystem
4. **Better Frontend Integration**: Same technology stack
5. **Reduced Complexity**: One less port to manage

### Former API Endpoints (Reference Only)

These endpoints existed in Go but are now in Express.js:

| Method | Former Endpoint (Go) | New Endpoint (Express.js) |
|--------|---------------------|---------------------------|
| GET | http://localhost:7250/api/logs/groups | http://localhost:3001/api/logs/groups |
| GET | http://localhost:7250/api/logs/group/:id | http://localhost:3001/api/logs/group/:id |
| GET | http://localhost:7250/api/logs/group/:id/tasks | (Not implemented yet) |
| GET | http://localhost:7250/api/logs/task/:id | (Not implemented yet) |
| GET | http://localhost:7250/health | (Not needed) |

### Express.js Implementation

**Location**: `todo_serer/routes/logs.js` (in Express.js backend)

**How Express.js Accesses TimescaleDB**:

Option 1 (Current - Separate Connection):
```javascript
// Express.js creates its own TimescaleDB connection
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/todo_history'
})
```

Option 2 (Theoretical - Using Go functions):
- Could use Go as a shared library
- Not currently implemented
- Not recommended (adds complexity)

### Database Query Functions Still Available

The Go service still exports query functions in `db/timescale.go`:

```go
func GetGroupLogs(groupId string) ([]map[string]interface{}, error)
func GetTaskLogs(taskId string) ([]map[string]interface{}, error)
func GetGroupsSummary() ([]map[string]interface{}, error)
func GetGroupTasksSummary(groupId string) ([]map[string]interface{}, error)
```

**Status**: Available but unused by Go service itself
**Purpose**: Could be used by other Go services in the future
**Current Usage**: None (Express.js queries DB directly)

### api/server.go File Contents (Summary)

**File is kept for reference only and may be deleted in the future.**

**Contents**:
- HTTP server setup on port 7250
- CORS headers configuration
- REST endpoint handlers:
  - `getGroupsSummary` - Calls db.GetGroupsSummary()
  - `handleGroupRoutes` - Calls db.GetGroupLogs() or db.GetGroupTasksSummary()
  - `getTaskLogs` - Calls db.GetTaskLogs()
- Health check endpoint

**Note in file**:
```go
// =====================================================================
// NOTE: This API server is NO LONGER USED
// =====================================================================
// The history logs API functionality has been migrated to the Express.js
// backend (todo_serer/routes/logs.js) running on port 3001.
```

---

## Error Handling & Resilience

### Error Handling Philosophy

**Principle**: Never crash, always continue

The Go consumer is designed to be resilient and continue operating despite errors. It follows a "log and continue" approach rather than "fail fast."

### Error Categories

#### 1. Kafka Read Errors

**Error**: Failed to read message from Kafka

**Code**:
```go
m, err := reader.ReadMessage(context.Background())
if err != nil {
    fmt.Printf("❌ Read error: %v\n", err)
    time.Sleep(2 * time.Second)
    continue
}
```

**Handling Strategy**:
- Log the error with ❌ emoji
- Wait 2 seconds (prevent tight error loop)
- Continue to next iteration (retry)
- Never exit

**Possible Causes**:
- Network connectivity issues
- Kafka broker down
- Topic doesn't exist
- Permission denied

**Recovery**:
- Automatic retry after 2 seconds
- Will reconnect when Kafka is available
- No manual intervention needed

#### 2. JSON Parse Errors

**Error**: Failed to unmarshal JSON message

**Code**:
```go
var e Event
if err := json.Unmarshal(m.Value, &e); err != nil {
    fmt.Printf("⚠️ JSON parse error: %v\n", err)
    continue
}
```

**Handling Strategy**:
- Log the error with ⚠️ emoji
- Skip the message (cannot process)
- Continue to next message
- Message is lost (not reprocessed)

**Possible Causes**:
- Malformed JSON from producer
- Schema mismatch
- Encoding issues
- Corrupted message

**Recovery**:
- Message is skipped
- Next message is processed normally
- Fix producer to prevent future errors

#### 3. Timestamp Parse Errors

**Error**: Failed to parse ISO 8601 timestamp

**Code**:
```go
ts, err := time.Parse(time.RFC3339, e.Timestamp)
if err != nil {
    ts = time.Now().UTC()
}
```

**Handling Strategy**:
- No error log (silent fallback)
- Use current time as fallback
- Continue processing
- Event still saved (with approximate time)

**Possible Causes**:
- Wrong timestamp format
- Timezone issues
- Empty timestamp string

**Recovery**:
- Automatic fallback to current time
- Event is not lost
- Timestamp may be slightly inaccurate

#### 4. Database Insert Errors

**Error**: Failed to insert log into TimescaleDB

**Code**:
```go
if err := db.InsertLog(...); err != nil {
    fmt.Printf("❌ DB insert error: %v\n", err)
    continue
}
```

**Handling Strategy**:
- Log the error with ❌ emoji
- Skip the message
- Continue to next message
- Message is lost (Kafka offset advances)

**Possible Causes**:
- Database connection lost
- Schema mismatch
- Constraint violation
- Disk full
- Permission denied

**Recovery**:
- Next message may succeed
- If DB is down, all inserts will fail (see mitigation below)
- Reconnection happens automatically

### Error Resilience Patterns

#### Pattern 1: Infinite Retry Loop

**Code**:
```go
for {
    // Read message, process, insert
    // On error: log and continue
}
```

**Behavior**:
- Service never exits on errors
- Continues processing indefinitely
- Self-healing on transient errors

#### Pattern 2: Exponential Backoff (Partial)

**Current Implementation**:
```go
time.Sleep(2 * time.Second)  // Fixed 2-second delay
```

**Better Implementation (Not Implemented)**:
```go
backoff := 2 * time.Second
for {
    err := reader.ReadMessage()
    if err != nil {
        time.Sleep(backoff)
        backoff = min(backoff * 2, 60 * time.Second)
        continue
    }
    backoff = 2 * time.Second  // Reset on success
}
```

#### Pattern 3: Connection Pooling

**Benefits**:
- Automatic connection recycling
- Handles database disconnections
- Retries failed connections
- Managed by pgxpool library

### Critical Failure Scenarios

#### Scenario 1: Database Completely Down

**Behavior**:
- All insert operations fail
- Console flooded with error messages
- Kafka offsets still advance (messages lost)
- Service continues running

**Mitigation**:
- Monitor database health
- Set up alerts for insert failures
- Consider dead-letter queue for failed messages

#### Scenario 2: Kafka Completely Down

**Behavior**:
- ReadMessage blocks indefinitely
- Service appears "stuck"
- No CPU usage (waiting for Kafka)
- Automatically resumes when Kafka returns

**Mitigation**:
- Monitor Kafka health
- Set up alerts for consumer lag
- Use context with timeout (not currently implemented)

#### Scenario 3: Schema Mismatch

**Behavior**:
- JSON unmarshal fails for all messages
- All messages skipped
- Service runs but does nothing useful

**Mitigation**:
- Version your event schemas
- Test schema changes before deploying
- Monitor unmarshal error rate

### Logging for Error Monitoring

**Current Logging**:
```go
fmt.Printf("❌ Read error: %v\n", err)
fmt.Printf("⚠️ JSON parse error: %v\n", err)
fmt.Printf("❌ DB insert error: %v\n", err)
```

**Emoji Legend**:
- ❌ = Critical error (Kafka/DB issues)
- ⚠️ = Warning (Parse errors)
- ✅ = Success (Connections)
- 📝 = Info (Events processed)
- 🚀 = Startup
- 🧩 = Schema operations

**Recommended Improvements**:
1. **Structured Logging**: JSON format for log aggregation
2. **Error Metrics**: Count errors by type
3. **Alerting**: Alert on error rate thresholds
4. **Log Levels**: INFO, WARN, ERROR, DEBUG

### Recovery Checklist

**If service is not processing events:**

- [ ] Check if Kafka is running: `netstat -an | findstr "9092"`
- [ ] Check if TimescaleDB is running: `netstat -an | findstr "5432"`
- [ ] Check service logs for errors
- [ ] Verify Kafka topic exists: `kafka-topics --list`
- [ ] Verify database exists: `psql -U postgres -l`
- [ ] Check consumer lag: `kafka-consumer-groups --describe --group todo-consumer-group-go`
- [ ] Restart the service: `.\consumer.exe`

---

## Logging & Monitoring

### Console Logging

#### Logging Format

The service uses emoji-prefixed console output for easy visual scanning:

**Success Messages**:
```
🚀 Starting Go Kafka Consumer Service
📋 Role: Consume Kafka events → Write to TimescaleDB
✅ Connected to TimescaleDB
🧩 TimescaleDB schema verified (todo_event_logs with group-task relationships ready)
📡 Connecting to Kafka broker...
🚀 Go Kafka Consumer started on topic: todo-history-events
```

**Event Processing**:
```
📝 [created] 15:30:45 - Task 'Implement login' was created (Group: Project Alpha, Task: Implement login)
📝 [updated] 15:31:20 - Group name changed to 'Project Beta' (Group: Project Beta, Task: )
📝 [status_changed] 15:32:10 - Status changed to completed (Group: Project Alpha, Task: Fix bug)
```

**Error Messages**:
```
❌ Read error: connection refused
⚠️ JSON parse error: invalid character '}' looking for beginning of value
❌ DB insert error: connection to database failed
```

#### Emoji Legend

| Emoji | Level | Usage |
|-------|-------|-------|
| 🚀 | INFO | Service startup, initialization |
| ✅ | SUCCESS | Successful connections |
| 🧩 | INFO | Schema operations |
| 📡 | INFO | Network operations |
| 📝 | INFO | Event processing |
| ⚠️ | WARNING | Recoverable errors |
| ❌ | ERROR | Critical errors |

### Log Output Analysis

#### Successful Event Processing

**Format**:
```
📝 [EventType] HH:MM:SS - Changes (Group: GroupName, Task: TaskName)
```

**Example**:
```
📝 [created] 10:15:30 - Group 'Sprint Planning' was created (Group: Sprint Planning, Task: )
📝 [created] 10:16:45 - Task 'Review PR #123' was created (Group: Sprint Planning, Task: Review PR #123)
📝 [status_changed] 10:20:12 - Status changed to in-progress (Group: Sprint Planning, Task: Review PR #123)
```

**Information Provided**:
- Event type (created, updated, etc.)
- Time of processing (HH:MM:SS)
- Human-readable change description
- Group context
- Task context (if applicable)

#### Error Patterns

**Kafka Connection Issues**:
```
❌ Read error: dial tcp 127.0.0.1:9092: connect: connection refused
❌ Read error: dial tcp 127.0.0.1:9092: connect: connection refused
```

**Database Issues**:
```
❌ DB insert error: failed to connect to `host=localhost user=postgres database=todo_history`: dial error
```

**Malformed Events**:
```
⚠️ JSON parse error: invalid character 'x' looking for beginning of value
```

### Monitoring Strategies

#### 1. Log File Monitoring

**Current**: No file logging (console only)

**Recommended Setup**:
```bash
# Redirect output to file
.\consumer.exe > consumer.log 2>&1

# Or with rotation
.\consumer.exe | tee -a consumer.log
```

**Analysis Commands**:
```bash
# Count successful events today
grep "📝" consumer.log | grep "$(date +%Y-%m-%d)" | wc -l

# Count errors
grep "❌" consumer.log | wc -l

# Monitor in real-time
tail -f consumer.log
```

#### 2. Metrics to Monitor

| Metric | How to Measure | Threshold |
|--------|----------------|-----------|
| **Events/Second** | Count 📝 logs per time window | Alert if < 1/sec for 5min |
| **Error Rate** | Count ❌ logs per time window | Alert if > 5% |
| **Kafka Lag** | Use kafka-consumer-groups | Alert if > 1000 messages |
| **DB Connection** | Check for ✅ on startup | Alert if absent |
| **Process Running** | Check process exists | Alert if stopped |

#### 3. Health Check Implementation (Not Currently Implemented)

**Recommended Addition**:

Create a health check endpoint:

```go
// Add to main.go
go func() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "healthy",
            "service": "go-kafka-consumer",
            "timestamp": time.Now().Format(time.RFC3339),
        })
    })
    log.Fatal(http.ListenAndServe(":8080", nil))
}()
```

**Check Health**:
```bash
curl http://localhost:8080/health
```

#### 4. Prometheus Metrics (Not Implemented)

**Recommended Metrics**:

```go
var (
    eventsProcessed = prometheus.NewCounter(prometheus.CounterOpts{
        Name: "kafka_events_processed_total",
        Help: "Total number of events processed",
    })

    eventsErrors = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "kafka_events_errors_total",
        Help: "Total number of processing errors",
    }, []string{"type"})

    processingDuration = prometheus.NewHistogram(prometheus.HistogramOpts{
        Name: "kafka_event_processing_duration_seconds",
        Help: "Event processing duration in seconds",
    })
)
```

**Expose Metrics**:
```go
http.Handle("/metrics", promhttp.Handler())
```

#### 5. Grafana Dashboard (Future Enhancement)

**Recommended Panels**:
1. Events processed (time series)
2. Error rate (percentage)
3. Processing latency (histogram)
4. Consumer lag (gauge)
5. Database connection status (status)

### Logging Best Practices

#### Current Limitations

- ❌ No log levels (all logs are INFO level)
- ❌ No structured logging (plain text)
- ❌ No log rotation
- ❌ No correlation IDs
- ❌ No log aggregation
- ❌ Console only (no file output)

#### Recommended Improvements

**1. Use Structured Logging**

Install library:
```bash
go get -u go.uber.org/zap
```

Implement:
```go
logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("event processed",
    zap.String("event_type", eventType),
    zap.String("group_id", groupId),
    zap.String("task_id", taskId),
    zap.Duration("processing_time", duration),
)
```

**2. Add Log Levels**

```go
logger.Debug("reading kafka message")     // Development only
logger.Info("event processed")             // Normal operation
logger.Warn("json parse error")            // Recoverable issues
logger.Error("database insert failed")     // Critical errors
```

**3. Add Correlation IDs**

```go
correlationID := uuid.New().String()
logger.Info("event received",
    zap.String("correlation_id", correlationID),
    zap.String("event_type", eventType),
)
```

**4. Log Rotation**

Use lumberjack:
```bash
go get -u gopkg.in/natefinch/lumberjack.v2
```

```go
logger := zap.New(zapcore.NewCore(
    encoder,
    zapcore.AddSync(&lumberjack.Logger{
        Filename:   "/var/log/consumer/consumer.log",
        MaxSize:    100, // MB
        MaxBackups: 3,
        MaxAge:     28, // days
    }),
    zap.InfoLevel,
))
```

### Monitoring Tools

#### Recommended Stack

1. **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
2. **Metrics**: Prometheus + Grafana
3. **Alerting**: Prometheus Alertmanager
4. **Tracing**: Jaeger (for distributed tracing)

#### Quick Monitoring Setup

**Docker Compose Addition**:
```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Flow Diagrams

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETE SYSTEM ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │  React 19 + Vite
│  Port 5173   │
└──────┬───────┘
       │
       │ HTTP REST API
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│              Express.js Backend (Port 3001)                   │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  REST API       │  │  PostgreSQL     │  │  Kafka       │ │
│  │  Routes         │  │  (Main DB)      │  │  Producer    │ │
│  │  /api/groups    │  │  todo_server DB │  │              │ │
│  │  /api/tasks     │  │                 │  │              │ │
│  │  /api/logs      │  │  - Users        │  │              │ │
│  └─────────────────┘  │  - Groups       │  └──────┬───────┘ │
│                       │  - Tasks        │         │         │
│                       │  - Comments     │         │         │
│                       └─────────────────┘         │         │
└───────────────────────────────────────────────────┼─────────┘
                                                    │
                                    Publish Events  │
                                    (JSON messages) │
                                                    ▼
                                           ┌─────────────────┐
                                           │  Apache Kafka   │
                                           │  Port 9092      │
                                           │                 │
                                           │  Topic:         │
                                           │  todo-history-  │
                                           │  events         │
                                           └────────┬────────┘
                                                    │
                                    Consume Events  │
                                                    │
                                                    ▼
┌───────────────────────────────────────────────────────────────┐
│           Go Kafka Consumer (This Service)                    │
│                                                               │
│  ┌──────────────┐                                            │
│  │  Main Entry  │  Initialization & Orchestration            │
│  │  main.go     │                                            │
│  └──────┬───────┘                                            │
│         │                                                    │
│         ├──> Connect to TimescaleDB                          │
│         │    (Connection pooling)                            │
│         │                                                    │
│         └──> Start Kafka Consumer                            │
│              (Infinite loop)                                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Kafka Consumer Loop (kafka/consumer.go)              │  │
│  │                                                        │  │
│  │  while true:                                           │  │
│  │    1. Read message from Kafka                          │  │
│  │    2. Unmarshal JSON → Event struct                    │  │
│  │    3. Parse timestamp (ISO 8601 → time.Time)           │  │
│  │    4. Extract group/task relationships                 │  │
│  │    5. Call db.InsertLog(...)                           │  │
│  │    6. Log to console                                   │  │
│  │    7. Handle errors (retry/skip)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database Layer (db/timescale.go)                     │  │
│  │                                                        │  │
│  │  - Connection pooling (pgxpool)                        │  │
│  │  - Schema management (CREATE TABLE + Hypertable)       │  │
│  │  - InsertLog() - Write event logs                      │  │
│  │  - GetGroupLogs() - Query functions (for Express.js)   │  │
│  │  - GetTaskLogs() - Query functions                     │  │
│  │  - GetGroupsSummary() - Aggregations                   │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             │ INSERT INTO todo_event_logs
                             │
                             ▼
                    ┌─────────────────────┐
                    │   TimescaleDB       │
                    │   Port 5432         │
                    │                     │
                    │   Database:         │
                    │   todo_history      │
                    │                     │
                    │   Hypertable:       │
                    │   todo_event_logs   │
                    │                     │
                    │   Partitioned by:   │
                    │   timestamp (1 day  │
                    │   chunks)           │
                    └──────────┬──────────┘
                               │
                               │ SELECT queries
                               │
                    ┌──────────▼──────────┐
                    │  Express.js Logs    │
                    │  API Endpoints      │
                    │  /api/logs/*        │
                    └──────────┬──────────┘
                               │
                               │ HTTP JSON Response
                               │
                    ┌──────────▼──────────┐
                    │   Frontend          │
                    │   (Display Logs)    │
                    └─────────────────────┘
```

### Event Processing Flow

```
┌──────────────────────────────────────────────────────────┐
│           EVENT PROCESSING DETAILED FLOW                  │
└──────────────────────────────────────────────────────────┘

USER ACTION (Frontend)
  │
  │ e.g., Create Task
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ Express.js Backend                                       │
│                                                          │
│ POST /api/groups/:id/tasks                              │
│   1. Validate request                                    │
│   2. Insert into PostgreSQL (todo_server DB)            │
│   3. Construct event JSON                                │
│   4. Publish to Kafka topic                              │
└────────────┬────────────────────────────────────────────┘
             │
             │ Kafka Message
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Kafka Topic: todo-history-events                         │
│                                                          │
│ {                                                        │
│   "eventType": "created",                                │
│   "timestamp": "2025-11-10T15:30:45.123Z",              │
│   "payload": {                                           │
│     "entity": "Task",                                    │
│     "entityId": "task-uuid",                             │
│     "groupId": "group-uuid",                             │
│     "groupName": "Project Alpha",                        │
│     "taskId": "task-uuid",                               │
│     "taskName": "Implement login",                       │
│     "changes": "Task created",                           │
│     "user": "john_doe",                                  │
│     "workspace": "default"                               │
│   }                                                      │
│ }                                                        │
└────────────┬────────────────────────────────────────────┘
             │
             │ Consumer reads
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Go Consumer - Kafka Reader                               │
│                                                          │
│ reader.ReadMessage(context.Background())                 │
│   - Blocks until message available                       │
│   - Returns message bytes                                │
└────────────┬────────────────────────────────────────────┘
             │
             │ Message received
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ JSON Unmarshal                                           │
│                                                          │
│ var e Event                                              │
│ json.Unmarshal(m.Value, &e)                              │
│                                                          │
│ Result:                                                  │
│   e.EventType = "created"                                │
│   e.Payload.Entity = "Task"                              │
│   e.Payload.EntityId = "task-uuid"                       │
│   e.Payload.GroupId = "group-uuid"                       │
│   ... etc                                                │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Timestamp Parsing                                        │
│                                                          │
│ ts, err := time.Parse(RFC3339, e.Timestamp)              │
│ if err != nil {                                          │
│   ts = time.Now().UTC()  // Fallback                     │
│ }                                                        │
│                                                          │
│ Result: ts = 2025-11-10 15:30:45 +0000 UTC              │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Entity Relationship Extraction                           │
│                                                          │
│ groupId := e.Payload.GroupId                             │
│ groupName := e.Payload.GroupName                         │
│ taskId := e.Payload.TaskId                               │
│ taskName := e.Payload.TaskName                           │
│                                                          │
│ if e.Payload.Entity == "Group":                          │
│   groupId = e.Payload.EntityId                           │
│                                                          │
│ if e.Payload.Entity == "Task":                           │
│   taskId = e.Payload.EntityId                            │
│                                                          │
│ Result:                                                  │
│   groupId = "group-uuid"                                 │
│   groupName = "Project Alpha"                            │
│   taskId = "task-uuid"                                   │
│   taskName = "Implement login"                           │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Database Insertion                                       │
│                                                          │
│ db.InsertLog(                                            │
│   "created",           // event_type                     │
│   "Task",              // entity                         │
│   "task-uuid",         // entity_id                      │
│   "group-uuid",        // group_id                       │
│   "Project Alpha",     // group_name                     │
│   "task-uuid",         // task_id                        │
│   "Implement login",   // task_name                      │
│   "Task created",      // changes                        │
│   "john_doe",          // user_name                      │
│   "default",           // workspace                      │
│   timestamp            // timestamp (UTC)                │
│ )                                                        │
└────────────┬────────────────────────────────────────────┘
             │
             │ SQL INSERT
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ TimescaleDB - todo_event_logs                            │
│                                                          │
│ INSERT INTO todo_event_logs (                            │
│   event_type, entity, entity_id,                         │
│   group_id, group_name, task_id, task_name,              │
│   changes, user_name, workspace, timestamp               │
│ ) VALUES (...)                                           │
│                                                          │
│ Row inserted:                                            │
│   id: 123 (auto-generated)                               │
│   timestamp: 2025-11-10 15:30:45+00                      │
│   event_type: 'created'                                  │
│   entity: 'Task'                                         │
│   ... (all fields populated)                             │
└────────────┬────────────────────────────────────────────┘
             │
             │ Insert successful
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Console Logging                                          │
│                                                          │
│ fmt.Printf(                                              │
│   "📝 [%s] %s - %s (Group: %s, Task: %s)\n",            │
│   "created",                                             │
│   "15:30:45",                                            │
│   "Task created",                                        │
│   "Project Alpha",                                       │
│   "Implement login"                                      │
│ )                                                        │
│                                                          │
│ Output:                                                  │
│ 📝 [created] 15:30:45 - Task created                    │
│    (Group: Project Alpha, Task: Implement login)         │
└────────────┬────────────────────────────────────────────┘
             │
             │ Loop back
             │
             ▼
       [Read next message...]
```

### Database Query Flow (Express.js → TimescaleDB)

```
┌──────────────────────────────────────────────────────────┐
│         LOG RETRIEVAL FLOW (Read Path)                   │
└──────────────────────────────────────────────────────────┘

USER REQUEST (Frontend)
  │
  │ GET /api/logs/group/group-uuid-123
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ Express.js Backend - Logs API                            │
│ (todo_serer/routes/logs.js)                             │
│                                                          │
│ router.get('/logs/group/:groupId', async (req, res) => { │
│   const { groupId } = req.params                         │
│   // Query TimescaleDB directly                          │
│   const result = await pool.query(`                      │
│     SELECT * FROM todo_event_logs                        │
│     WHERE group_id = $1                                  │
│     ORDER BY timestamp DESC                              │
│     LIMIT 100                                            │
│   `, [groupId])                                          │
│   res.json({ success: true, data: result.rows })         │
│ })                                                       │
└────────────┬────────────────────────────────────────────┘
             │
             │ SQL Query
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ TimescaleDB - todo_event_logs                            │
│                                                          │
│ Hypertable query optimization:                           │
│   1. Use idx_group_id index                              │
│   2. Scan only relevant time chunks                      │
│   3. Return up to 100 rows                               │
│                                                          │
│ Results:                                                 │
│ [                                                        │
│   {                                                      │
│     id: 123,                                             │
│     timestamp: 2025-11-10T15:30:45Z,                     │
│     event_type: 'created',                               │
│     entity: 'Task',                                      │
│     ...                                                  │
│   },                                                     │
│   ...                                                    │
│ ]                                                        │
└────────────┬────────────────────────────────────────────┘
             │
             │ Result rows
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Express.js - Format Response                             │
│                                                          │
│ {                                                        │
│   "success": true,                                       │
│   "data": [                                              │
│     {                                                    │
│       "id": 123,                                         │
│       "timestamp": "2025-11-10T15:30:45Z",              │
│       "eventType": "created",                            │
│       "entity": "Task",                                  │
│       "groupId": "group-uuid-123",                       │
│       "groupName": "Project Alpha",                      │
│       "changes": "Task created",                         │
│       ...                                                │
│     }                                                    │
│   ]                                                      │
│ }                                                        │
└────────────┬────────────────────────────────────────────┘
             │
             │ HTTP JSON Response
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend - Display Logs                                  │
│                                                          │
│ - Render log entries in UI                               │
│ - Show timeline of events                                │
│ - Display user actions                                   │
└─────────────────────────────────────────────────────────┘

NOTE: Go consumer does NOT participate in read operations
      Database query functions exist in db/timescale.go
      but are not used by the Go service itself
```

---

## Build & Deployment

### Building from Source

#### Prerequisites

- Go 1.22 or higher
- Git (optional, for version control)

#### Build Commands

**Windows:**
```bash
# Navigate to project directory
cd C:\Users\bdhayalesh\Desktop\KTern\kafka\go-consumer

# Download dependencies
go mod download

# Build executable
go build -o consumer.exe main.go

# Run the executable
.\consumer.exe
```

**Linux:**
```bash
# Build for Linux
GOOS=linux GOARCH=amd64 go build -o consumer main.go

# Run
./consumer
```

**macOS:**
```bash
# Build for macOS
GOOS=darwin GOARCH=amd64 go build -o consumer main.go

# Run
./consumer
```

#### Cross-Compilation

Build for multiple platforms:

```bash
# Windows (from any OS)
GOOS=windows GOARCH=amd64 go build -o consumer.exe main.go

# Linux (from any OS)
GOOS=linux GOARCH=amd64 go build -o consumer main.go

# macOS (from any OS)
GOOS=darwin GOARCH=amd64 go build -o consumer main.go

# ARM64 (Raspberry Pi, AWS Graviton)
GOOS=linux GOARCH=arm64 go build -o consumer-arm64 main.go
```

### Build Optimization

#### Standard Build
```bash
go build -o consumer main.go
```
- Size: ~16-20 MB
- Includes debug symbols
- Suitable for development

#### Optimized Build
```bash
go build -ldflags="-s -w" -o consumer main.go
```
- `-s`: Omit symbol table
- `-w`: Omit DWARF debug info
- Size: ~12-15 MB
- Suitable for production

#### Minimal Build
```bash
CGO_ENABLED=0 go build -ldflags="-s -w" -o consumer main.go
```
- Static binary (no C dependencies)
- Portable across Linux distributions
- Size: ~12-15 MB

### Deployment Methods

#### Method 1: Direct Executable

**Steps:**
1. Build the executable
2. Copy to target server
3. Run directly

```bash
# On target server
./consumer
```

**Pros:**
- Simple and straightforward
- No container overhead
- Fast startup

**Cons:**
- Manual process management
- No automatic restart
- Environment-specific builds

#### Method 2: Systemd Service (Linux)

**Create service file:** `/etc/systemd/system/go-consumer.service`

```ini
[Unit]
Description=Go Kafka Consumer for Todo Events
After=network.target kafka.service timescaledb.service

[Service]
Type=simple
User=todoapp
WorkingDirectory=/opt/go-consumer
ExecStart=/opt/go-consumer/consumer
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Environment variables (if implemented)
# Environment="KAFKA_BROKERS=localhost:9092"
# Environment="TIMESCALE_URI=postgres://..."

[Install]
WantedBy=multi-user.target
```

**Manage service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable go-consumer

# Start service
sudo systemctl start go-consumer

# Check status
sudo systemctl status go-consumer

# View logs
sudo journalctl -u go-consumer -f

# Stop service
sudo systemctl stop go-consumer
```

**Pros:**
- Automatic restart on failure
- Starts on boot
- Log management
- Service dependencies

#### Method 3: Docker Container

**Dockerfile:**
```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o consumer main.go

# Runtime stage
FROM alpine:latest

# Install CA certificates (for HTTPS)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/consumer .

# Run the application
CMD ["./consumer"]
```

**Build and run:**
```bash
# Build image
docker build -t go-consumer:latest .

# Run container
docker run -d \
  --name go-consumer \
  --network kafka-network \
  --restart unless-stopped \
  go-consumer:latest

# View logs
docker logs -f go-consumer

# Stop container
docker stop go-consumer
```

**Pros:**
- Consistent environment
- Easy deployment
- Portable across systems
- Resource isolation

#### Method 4: Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  go-consumer:
    build:
      context: ./go-consumer
      dockerfile: Dockerfile
    container_name: go-consumer
    restart: unless-stopped
    depends_on:
      - kafka
      - timescaledb
    networks:
      - kafka-network
    # If environment variables are implemented:
    # environment:
    #   - KAFKA_BROKERS=kafka:9092
    #   - TIMESCALE_URI=postgres://postgres:postgres@timescaledb:5432/todo_history
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  kafka-network:
    external: true
```

**Commands:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f go-consumer

# Restart service
docker-compose restart go-consumer

# Stop all services
docker-compose down
```

### Deployment Checklist

**Pre-deployment:**
- [ ] Kafka broker is running and accessible
- [ ] TimescaleDB is running with `todo_history` database
- [ ] Kafka topic `todo-history-events` exists
- [ ] TimescaleDB user has necessary permissions
- [ ] Network connectivity verified

**Deployment:**
- [ ] Build executable for target platform
- [ ] Copy executable to target server
- [ ] Set up process manager (systemd/Docker)
- [ ] Configure automatic restart
- [ ] Set up log rotation/management

**Post-deployment:**
- [ ] Verify service is running
- [ ] Check logs for successful startup
- [ ] Monitor initial event processing
- [ ] Verify database inserts are working
- [ ] Set up monitoring and alerts

### Production Considerations

#### 1. Logging

**Current**: Console output only

**Recommended**:
- Redirect stdout to file
- Use log rotation (logrotate or lumberjack)
- Implement structured logging (zap or zerolog)
- Send logs to centralized system (ELK, Splunk)

#### 2. Monitoring

**Recommended**:
- Health check endpoint
- Prometheus metrics
- Consumer lag monitoring
- Error rate tracking
- Database connection monitoring

#### 3. High Availability

**Current**: Single instance

**Recommended for HA**:
- Run multiple consumer instances
- Use same GroupID for load distribution
- Monitor consumer lag
- Set up alerts for consumer group issues

#### 4. Security

**Hardcoded Credentials** (Current):
```go
timescaleURI := "postgres://postgres:postgres@localhost:5432/todo_history"
```

**Recommended**:
- Use environment variables
- Use secret management (Vault, AWS Secrets Manager)
- Enable SSL/TLS for database connections
- Enable SASL/SSL for Kafka connections
- Run as non-root user

#### 5. Performance Tuning

**Database Connection Pool**:
```go
// Currently uses defaults
// Recommended: Configure explicitly
config, _ := pgxpool.ParseConfig(uri)
config.MaxConns = 10
config.MinConns = 2
config.MaxConnLifetime = time.Hour
config.MaxConnIdleTime = 30 * time.Minute
Pool, _ = pgxpool.NewWithConfig(context.Background(), config)
```

**Kafka Consumer Tuning**:
```go
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"localhost:9092"},
    Topic:          "todo-history-events",
    GroupID:        "todo-consumer-group-go",
    MinBytes:       1,        // Minimum batch size
    MaxBytes:       10e6,     // Maximum batch size (10MB)
    CommitInterval: time.Second,  // Commit frequency
    StartOffset:    kafka.LastOffset,  // Start from latest
})
```

### Rollback Strategy

**If deployment fails:**

1. **Stop the new service**
   ```bash
   systemctl stop go-consumer
   # or
   docker stop go-consumer
   ```

2. **Restore previous version**
   ```bash
   cp consumer.exe.backup consumer.exe
   # or
   docker run go-consumer:previous
   ```

3. **Restart service**
   ```bash
   systemctl start go-consumer
   ```

4. **Verify operation**
   ```bash
   systemctl status go-consumer
   tail -f /var/log/consumer.log
   ```

---

## Development Guidelines

### Code Organization

#### Package Structure

```
todo-consumer/
├── main.go          # Entry point, orchestration
├── kafka/           # Kafka-specific logic
│   └── consumer.go  # Event consumption
├── db/              # Database operations
│   └── timescale.go # TimescaleDB queries
└── api/             # Deprecated API layer
    └── server.go    # Not used
```

#### Separation of Concerns

- **main.go**: Service initialization only
- **kafka/**: All Kafka-related code
- **db/**: All database-related code
- No business logic mixing

### Coding Standards

#### Naming Conventions

**Variables:**
```go
// Good
eventType := "created"
groupId := "group-123"
timestamp := time.Now()

// Avoid
et := "created"
gid := "group-123"
t := time.Now()
```

**Functions:**
```go
// Exported (public)
func InsertLog(...)  // PascalCase
func GetGroupLogs()

// Unexported (private)
func ensureSchema()  // camelCase
func parseTimestamp()
```

**Constants:**
```go
const (
    DefaultKafkaBroker = "localhost:9092"
    DefaultTopic       = "todo-history-events"
    RetryDelay         = 2 * time.Second
)
```

#### Error Handling

**Always check errors:**
```go
// Good
result, err := doSomething()
if err != nil {
    log.Printf("Error: %v", err)
    return err
}

// Avoid
result, _ := doSomething()  // Don't ignore errors
```

**Use formatted errors:**
```go
return fmt.Errorf("failed to connect to database: %w", err)
```

#### Comments

**Package-level:**
```go
// Package kafka provides Kafka consumer functionality for todo events.
package kafka
```

**Function-level:**
```go
// InsertLog inserts a new event log entry into the TimescaleDB hypertable.
// Returns an error if the database operation fails.
func InsertLog(eventType, entity string, ...) error {
```

**Inline comments:**
```go
// Parse ISO timestamp or fallback to now
ts, err := time.Parse(time.RFC3339, e.Timestamp)
if err != nil {
    ts = time.Now().UTC()  // Use current time if parsing fails
}
```

### Testing (Not Currently Implemented)

#### Recommended Test Structure

```
go-consumer/
├── kafka/
│   ├── consumer.go
│   └── consumer_test.go
├── db/
│   ├── timescale.go
│   └── timescale_test.go
└── main_test.go
```

#### Unit Tests Example

```go
// db/timescale_test.go
package db

import (
    "testing"
    "time"
)

func TestInsertLog(t *testing.T) {
    // Setup test database
    testURI := "postgres://postgres:postgres@localhost:5432/test_db"
    if err := Init(testURI); err != nil {
        t.Fatalf("Failed to init test DB: %v", err)
    }
    defer Pool.Close()

    // Test insertion
    err := InsertLog(
        "created",
        "Task",
        "test-id",
        "group-id",
        "Test Group",
        "task-id",
        "Test Task",
        "Test event",
        "test_user",
        "default",
        time.Now(),
    )

    if err != nil {
        t.Errorf("InsertLog failed: %v", err)
    }
}
```

#### Integration Tests

```go
// kafka/consumer_test.go
package kafka

import (
    "context"
    "testing"
    "github.com/segmentio/kafka-go"
)

func TestKafkaConsumer(t *testing.T) {
    // Setup test Kafka
    // Publish test message
    // Verify consumption
}
```

#### Running Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run with verbose output
go test -v ./...

# Run specific test
go test -run TestInsertLog ./db
```

### Configuration Management

#### Current Approach (Hardcoded)

```go
// Not recommended for production
timescaleURI := "postgres://postgres:postgres@localhost:5432/todo_history"
```

#### Recommended Approach (Environment Variables)

```go
package main

import (
    "os"
)

func getEnv(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}

func main() {
    kafkaBrokers := getEnv("KAFKA_BROKERS", "localhost:9092")
    kafkaTopic := getEnv("KAFKA_TOPIC", "todo-history-events")
    timescaleURI := getEnv("TIMESCALE_URI", "postgres://localhost/todo_history")

    // Use variables
}
```

### Dependency Management

#### Adding Dependencies

```bash
# Add new dependency
go get github.com/some/package

# Update go.mod and go.sum
go mod tidy

# Verify dependencies
go mod verify
```

#### Updating Dependencies

```bash
# Update all dependencies
go get -u ./...

# Update specific dependency
go get -u github.com/segmentio/kafka-go

# Update to specific version
go get github.com/jackc/pgx/v5@v5.6.0

# Tidy up
go mod tidy
```

### Code Quality Tools

#### Linting

```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run linter
golangci-lint run

# Auto-fix issues
golangci-lint run --fix
```

#### Formatting

```bash
# Format code
go fmt ./...

# Or use gofmt
gofmt -w .

# Check formatting
gofmt -l .
```

#### Static Analysis

```bash
# Run go vet
go vet ./...

# Install staticcheck
go install honnef.co/go/tools/cmd/staticcheck@latest

# Run staticcheck
staticcheck ./...
```

### Git Workflow

#### Branch Strategy

```
main          # Production-ready code
└── develop   # Integration branch
    ├── feature/kafka-improvements
    ├── feature/structured-logging
    └── bugfix/connection-retry
```

#### Commit Messages

**Format:**
```
type(scope): short description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(kafka): add exponential backoff for retries

Implement exponential backoff with max delay of 60 seconds
to prevent overwhelming Kafka during outages.

Fixes #42
```

```
fix(db): prevent connection pool exhaustion

Close connections properly after failed inserts
```

### Performance Optimization

#### Profiling

```go
import (
    "runtime/pprof"
    "os"
)

// CPU profiling
f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()

// Memory profiling
f, _ := os.Create("mem.prof")
pprof.WriteHeapProfile(f)
f.Close()
```

**Analyze profiles:**
```bash
go tool pprof cpu.prof
go tool pprof mem.prof
```

#### Benchmarking

```go
// db/timescale_bench_test.go
func BenchmarkInsertLog(b *testing.B) {
    Init("postgres://...")

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        InsertLog(...)
    }
}
```

**Run benchmarks:**
```bash
go test -bench=. ./...
```

### Security Best Practices

1. **Never hardcode credentials**
2. **Use environment variables or secret managers**
3. **Enable TLS for database connections**
4. **Enable SASL/SSL for Kafka**
5. **Run as non-root user**
6. **Validate input data**
7. **Keep dependencies updated**
8. **Use static analysis tools**

---

## Troubleshooting

### Common Issues

#### Issue 1: Cannot connect to Kafka

**Symptoms:**
```
❌ Read error: dial tcp 127.0.0.1:9092: connect: connection refused
```

**Possible Causes:**
1. Kafka is not running
2. Wrong Kafka broker address
3. Firewall blocking port 9092
4. Network connectivity issues

**Solutions:**

**Check if Kafka is running:**
```bash
# Windows
netstat -an | findstr "9092"

# Linux
netstat -tuln | grep 9092

# Or check Kafka process
ps aux | grep kafka
```

**Test Kafka connectivity:**
```bash
# List topics
kafka-topics --bootstrap-server localhost:9092 --list

# Consume from topic manually
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events --from-beginning
```

**Start Kafka if not running:**
```bash
# Using Docker
docker start kafka

# Or systemd
sudo systemctl start kafka
```

---

#### Issue 2: Cannot connect to TimescaleDB

**Symptoms:**
```
❌ Failed to connect to TimescaleDB: connection refused
```

**Possible Causes:**
1. PostgreSQL/TimescaleDB is not running
2. Wrong connection URI
3. Database doesn't exist
4. Authentication failed
5. Firewall blocking port 5432

**Solutions:**

**Check if PostgreSQL is running:**
```bash
# Windows
netstat -an | findstr "5432"

# Linux
sudo systemctl status postgresql
```

**Test database connection:**
```bash
psql -h localhost -U postgres -d todo_history
```

**Create database if missing:**
```sql
CREATE DATABASE todo_history;
\c todo_history
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

**Verify credentials:**
```bash
# Test with URI
psql "postgres://postgres:postgres@localhost:5432/todo_history"
```

---

#### Issue 3: Kafka topic doesn't exist

**Symptoms:**
```
❌ Read error: [3] Unknown Topic Or Partition
```

**Solutions:**

**Create topic:**
```bash
kafka-topics --bootstrap-server localhost:9092 \
  --create \
  --topic todo-history-events \
  --partitions 1 \
  --replication-factor 1
```

**Verify topic exists:**
```bash
kafka-topics --bootstrap-server localhost:9092 --list
```

---

#### Issue 4: JSON parse errors

**Symptoms:**
```
⚠️ JSON parse error: invalid character '}' looking for beginning of value
```

**Possible Causes:**
1. Malformed JSON from Express.js producer
2. Schema mismatch between producer and consumer
3. Wrong event structure

**Solutions:**

**Inspect Kafka messages manually:**
```bash
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --from-beginning \
  --property print.key=true
```

**Verify event structure matches:**
```go
type Event struct {
    EventType string  `json:"eventType"`
    Payload   Payload `json:"payload"`
    Timestamp string  `json:"timestamp"`
}
```

**Fix Express.js producer if needed**

---

#### Issue 5: High consumer lag

**Symptoms:**
- Events processed slowly
- Large offset difference

**Check consumer lag:**
```bash
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe \
  --group todo-consumer-group-go
```

**Output:**
```
GROUP                 TOPIC              PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
todo-consumer-group-go todo-history-events 0       1000            5000            4000
```

**Solutions:**

1. **Check database performance** (likely bottleneck)
   ```sql
   -- Check for slow queries
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. **Optimize database indexes** (already created)

3. **Scale horizontally** (add more consumer instances)
   ```bash
   # Run multiple instances with same GroupID
   ./consumer &
   ./consumer &
   ```

4. **Increase batch size** (modify consumer config)

---

#### Issue 6: Consumer stuck/not processing

**Symptoms:**
- No console output
- No new database rows
- Process appears frozen

**Possible Causes:**
1. Blocking on Kafka read (waiting for messages)
2. Database connection pool exhausted
3. Deadlock (unlikely in single-threaded consumer)

**Solutions:**

**Check if process is running:**
```bash
# Windows
tasklist | findstr "consumer"

# Linux
ps aux | grep consumer
```

**Check CPU usage:**
- 0% CPU = Likely waiting for Kafka messages (normal)
- 100% CPU = Infinite loop (bug)

**Restart the service:**
```bash
# Kill process
kill <PID>

# Restart
./consumer
```

**Check Kafka for new messages:**
```bash
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --from-beginning
```

---

#### Issue 7: Database insert errors

**Symptoms:**
```
❌ DB insert error: ERROR: null value in column "event_type" violates not-null constraint
```

**Possible Causes:**
1. Missing required fields in event
2. Schema mismatch
3. Constraint violations

**Solutions:**

**Verify table schema:**
```sql
\d todo_event_logs
```

**Check for null values in event:**
```go
// Add validation before insert
if eventType == "" {
    log.Printf("⚠️ Missing eventType, skipping")
    continue
}
```

**Inspect problematic events:**
```bash
# Enable verbose logging
fmt.Printf("DEBUG: Event data: %+v\n", e)
```

---

### Debugging Techniques

#### 1. Verbose Logging

**Add debug logs:**
```go
fmt.Printf("DEBUG: Received message: %s\n", string(m.Value))
fmt.Printf("DEBUG: Parsed event: %+v\n", e)
fmt.Printf("DEBUG: Inserting with groupId=%s, taskId=%s\n", groupId, taskId)
```

#### 2. Manual Kafka Testing

**Produce test event:**
```bash
kafka-console-producer --bootstrap-server localhost:9092 \
  --topic todo-history-events

# Paste JSON:
{"eventType":"created","timestamp":"2025-11-10T15:30:45Z","payload":{"entity":"Task","entityId":"test-123","groupId":"group-1","groupName":"Test","taskId":"test-123","taskName":"Test Task","changes":"Test event","user":"tester","workspace":"default"}}
```

**Verify consumer processes it**

#### 3. Database Queries

**Check recent logs:**
```sql
SELECT * FROM todo_event_logs
ORDER BY timestamp DESC
LIMIT 10;
```

**Count logs by type:**
```sql
SELECT event_type, COUNT(*)
FROM todo_event_logs
GROUP BY event_type;
```

**Check for specific group:**
```sql
SELECT * FROM todo_event_logs
WHERE group_id = 'your-group-id'
ORDER BY timestamp DESC;
```

#### 4. Network Diagnostics

**Test Kafka connectivity:**
```bash
telnet localhost 9092
```

**Test database connectivity:**
```bash
telnet localhost 5432
```

**Check firewall rules (Linux):**
```bash
sudo iptables -L -n | grep 9092
sudo iptables -L -n | grep 5432
```

---

### Performance Issues

#### Slow Processing

**Symptoms:**
- High latency between event and log
- Increasing consumer lag

**Diagnosis:**

**Check database performance:**
```sql
-- Query execution time
EXPLAIN ANALYZE
INSERT INTO todo_event_logs VALUES (...);

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('todo_event_logs'));

-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE relname = 'todo_event_logs';
```

**Solutions:**
1. Ensure indexes exist (should be auto-created)
2. Run VACUUM ANALYZE periodically
3. Check disk I/O performance
4. Consider connection pooling tuning

---

### Recovery Procedures

#### Full Service Restart

```bash
# 1. Stop consumer
kill <PID>
# or
systemctl stop go-consumer

# 2. Verify Kafka and DB are healthy
kafka-topics --bootstrap-server localhost:9092 --list
psql -U postgres -d todo_history -c "SELECT 1"

# 3. Restart consumer
./consumer
# or
systemctl start go-consumer

# 4. Verify operation
tail -f consumer.log
# Look for: ✅ Connected to TimescaleDB
#           🚀 Go Kafka Consumer started
```

#### Reset Consumer Offset (Caution!)

**Only if you want to reprocess all messages:**

```bash
# Stop consumer first!

# Reset to earliest
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group todo-consumer-group-go \
  --reset-offsets \
  --to-earliest \
  --topic todo-history-events \
  --execute

# Or reset to specific offset
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group todo-consumer-group-go \
  --reset-offsets \
  --to-offset 1000 \
  --topic todo-history-events \
  --execute

# Restart consumer
./consumer
```

**Warning**: This will reprocess messages and create duplicate logs!

---

### Getting Help

**Check logs first:**
```bash
# Console output
tail -f consumer.log

# Systemd logs
journalctl -u go-consumer -f

# Docker logs
docker logs -f go-consumer
```

**Gather diagnostic info:**
```bash
# System info
uname -a
go version

# Service status
systemctl status go-consumer

# Kafka status
kafka-topics --bootstrap-server localhost:9092 --list

# Database status
psql -U postgres -d todo_history -c "SELECT COUNT(*) FROM todo_event_logs"

# Consumer group status
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group todo-consumer-group-go
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Service Version**: Go 1.22
**Maintained By**: Development Team

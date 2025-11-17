# Todo Server - Complete Backend Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Flow](#architecture--flow)
4. [Directory Structure](#directory-structure)
5. [Database Schemas](#database-schemas)
6. [API Endpoints](#api-endpoints)
7. [Kafka Event System](#kafka-event-system)
8. [Configuration](#configuration)
9. [Setup & Installation](#setup--installation)
10. [Code Components](#code-components)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)

---

## System Overview

The Todo Server is a Node.js-based backend application for managing tasks, groups, and comments with event-sourcing capabilities. It uses MongoDB for operational data storage and integrates with Apache Kafka for event streaming, which feeds into TimescaleDB (PostgreSQL) for audit logging and historical analysis.

### Key Features
- RESTful API for task and group management
- Event-driven architecture with Kafka
- Time-series event logging with TimescaleDB
- Real-time comment system
- Multi-status task workflow
- User authentication (basic)

### System Architecture

```
┌──────────────┐
│   Client     │
│  (Browser/   │
│    App)      │
└──────┬───────┘
       │ HTTP/REST
       │
┌──────▼────────────────────────────────────┐
│    Express.js Server (Port 3001)          │
│  ┌─────────────────────────────────────┐  │
│  │  Routes Layer                       │  │
│  │  - /api/auth                        │  │
│  │  - /api/groups                      │  │
│  │  - /api/tasks                       │  │
│  │  - /api/logs                        │  │
│  └────┬──────────────────────┬─────────┘  │
│       │                      │             │
│  ┌────▼────────┐      ┌──────▼──────────┐ │
│  │  MongoDB    │      │  Kafka Producer │ │
│  │  (Mongoose) │      │  (KafkaJS)      │ │
│  └─────────────┘      └──────┬──────────┘ │
└──────────────────────────────┼────────────┘
                               │
                               │ Events
                               │
                    ┌──────────▼──────────┐
                    │   Apache Kafka      │
                    │   Topic:            │
                    │ todo-history-events │
                    └──────────┬──────────┘
                               │
                               │ Consume
                               │
                    ┌──────────▼──────────┐
                    │   Go Consumer       │
                    │   (Separate Service)│
                    └──────────┬──────────┘
                               │
                               │ Write
                               │
                    ┌──────────▼──────────┐
                    │   TimescaleDB       │
                    │   (PostgreSQL)      │
                    │   Event Logs        │
                    └─────────────────────┘
```

### Data Flow

```
1. Create/Update Request
   ↓
2. Express Route Handler
   ↓
3. MongoDB Operation (CRUD)
   ↓
4. Send HTTP Response to Client
   ↓
5. Publish Event to Kafka (async, non-blocking)
   ↓
6. Go Consumer picks up event
   ↓
7. Write to TimescaleDB
   ↓
8. Available for query via /api/logs
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime |
| **Express** | 5.1.0 | Web framework |
| **MongoDB** | 6.20.0 | NoSQL database (operational data) |
| **Mongoose** | 8.19.3 | MongoDB ODM |
| **KafkaJS** | 2.2.4 | Apache Kafka client |
| **PostgreSQL (pg)** | 8.11.3 | TimescaleDB driver |
| **TimescaleDB** | - | Time-series database (event logs) |

### Supporting Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| body-parser | 2.2.0 | Parse request bodies |
| cors | 2.8.5 | Enable CORS |
| dotenv | 17.2.3 | Environment variables |
| nodemon | 3.1.10 | Development hot reload |

### Infrastructure

- **MongoDB Atlas**: Cloud-hosted MongoDB cluster
- **Apache Kafka**: Local broker (localhost:9092)
- **TimescaleDB**: Local PostgreSQL with TimescaleDB extension
- **Go Consumer**: Separate service for Kafka consumption

---

## Architecture & Flow

### Request-Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

1. Client Request
   POST /api/groups/123/tasks
   Body: { name: "New Task", status: "New" }

2. Express Middleware
   ├── CORS Handler
   ├── Body Parser
   └── Route Matcher → routes/groups.js

3. Route Handler
   ├── Extract groupId from params
   ├── Validate request body
   └── Call MongoDB operations

4. MongoDB Operations
   ├── Create Task document
   ├── Update Group.tasks array
   └── Return saved task

5. HTTP Response
   ├── Status: 201 Created
   └── Body: { task: {...}, message: "..." }

6. Post-Response Event (setImmediate)
   ├── Prepare Kafka event payload
   ├── Publish to 'todo-history-events' topic
   └── Log any Kafka errors (non-blocking)

7. Background Processing
   ├── Go Consumer reads from Kafka
   ├── Processes event
   └── Writes to TimescaleDB
```

### Event Sourcing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  EVENT SOURCING PATTERN                      │
└─────────────────────────────────────────────────────────────┘

State Change (MongoDB)
       ↓
Event Published (Kafka)
       ↓
Event Stored (Kafka Log)
       ↓
Consumer Processes (Go Service)
       ↓
Historical Record (TimescaleDB)
       ↓
Queryable via /api/logs

Benefits:
- Audit trail of all changes
- Time-series analysis
- Replay capability
- Debugging and monitoring
```

### Status Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK STATUS FLOW                          │
└─────────────────────────────────────────────────────────────┘

    New
     │
     ├──────→ Backlog
     │           │
     │           ↓
     │      In Progress
     │           │
     │           ↓
     │       Completed
     │           │
     │           ↓
     └────────→ Approved

Allowed Values:
- New (default)
- Backlog
- In Progress
- Completed
- Approved

Status changes trigger STATUS_CHANGED events
```

---

## Directory Structure

```
todo_serer/
│
├── index.js                      # Main application entry point
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependencies
├── .env                          # Environment variables (active)
├── .env.example                  # Environment template
├── README.md                     # Basic documentation
├── test-api.js                   # API integration tests
├── test-enhanced-events.js       # Event tracking tests
│
├── models/                       # Mongoose schemas (MongoDB)
│   ├── Task.js                   # Task model
│   ├── Group.js                  # Group model
│   ├── Comment.js                # Comment model
│   └── User.js                   # User model
│
├── routes/                       # Express route handlers
│   ├── tasks.js                  # Task CRUD endpoints
│   ├── groups.js                 # Group CRUD endpoints
│   ├── auth.js                   # Authentication endpoints
│   └── logs.js                   # Event log query endpoints
│
├── kafka/                        # Kafka integration
│   ├── producer.js               # Kafka event publisher (ACTIVE)
│   └── consumer.js               # Legacy consumer (DEPRECATED)
│
└── db/                           # Database utilities
    ├── timescale.js              # TimescaleDB connection & queries
    └── seedUsers.js              # Default user seeding
```

### File Responsibilities

| File | Lines | Primary Responsibility |
|------|-------|------------------------|
| `index.js` | ~70 | Server initialization, route registration |
| `models/Task.js` | ~30 | Task schema definition |
| `models/Group.js` | ~25 | Group schema definition |
| `models/Comment.js` | ~20 | Comment schema definition |
| `models/User.js` | ~15 | User schema definition |
| `routes/tasks.js` | ~180 | Task CRUD + comment endpoints |
| `routes/groups.js` | ~200 | Group CRUD + task creation |
| `routes/auth.js` | ~30 | Login and user endpoints |
| `routes/logs.js` | ~50 | Event log query endpoints |
| `kafka/producer.js` | ~100 | Kafka connection & event publishing |
| `db/timescale.js` | ~200 | TimescaleDB setup & queries |
| `db/seedUsers.js` | ~40 | Default user creation |

---

## Database Schemas

### MongoDB Collections (Mongoose Models)

#### 1. Groups Collection

**Schema Definition** ([models/Group.js](models/Group.js))

```javascript
{
  name: {
    type: String,
    required: true
  },
  discussion: {
    type: String
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  createdAt: Date,    // auto-generated
  updatedAt: Date     // auto-generated
}

// Virtual Field
taskCount: Number    // Computed from tasks.length
```

**Indexes:**
- Primary: `_id` (auto)
- No additional indexes defined

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Q1 2024 Projects",
  "discussion": "Tasks for first quarter",
  "tasks": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860eb"
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

#### 2. Tasks Collection

**Schema Definition** ([models/Task.js](models/Task.js))

```javascript
{
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['New', 'Backlog', 'In Progress', 'Completed', 'Approved'],
    default: 'New'
  },
  startDate: {
    type: String
  },
  endDate: {
    type: String
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: Date,    // auto-generated
  updatedAt: Date     // auto-generated
}

// Virtual Field
commentCount: Number    // Computed from comments.length
```

**Indexes:**
- Primary: `_id` (auto)
- Foreign: `groupId` (for queries)

**Example Document:**
```json
{
  "_id": "507f191e810c19729de860ea",
  "groupId": "507f1f77bcf86cd799439011",
  "name": "Implement authentication",
  "description": "Add JWT-based authentication system",
  "status": "In Progress",
  "startDate": "2024-01-10",
  "endDate": "2024-01-20",
  "comments": [
    "607f191e810c19729de860ec"
  ],
  "createdAt": "2024-01-10T09:00:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

#### 3. Comments Collection

**Schema Definition** ([models/Comment.js](models/Comment.js))

```javascript
{
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: Date,    // auto-generated
  updatedAt: Date     // auto-generated
}
```

**Example Document:**
```json
{
  "_id": "607f191e810c19729de860ec",
  "taskId": "507f191e810c19729de860ea",
  "text": "Started working on this. Need to research JWT libraries.",
  "timestamp": "2024-01-15T11:30:00.000Z",
  "createdAt": "2024-01-15T11:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

#### 4. Users Collection

**Schema Definition** ([models/User.js](models/User.js))

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: Date,    // auto-generated
  updatedAt: Date     // auto-generated
}
```

**Default Users** (seeded automatically):
```
Avinash : Avinash123
Dhaya : Dhaya123
Ashok : Ashok123
Arun : Arun123
Cathrine : Cathrine123
```

**⚠️ Security Warning**: Passwords are stored in plain text!

### TimescaleDB Tables (PostgreSQL)

#### todo_event_logs (Hypertable)

**Schema Definition** ([db/timescale.js](db/timescale.js))

```sql
CREATE TABLE IF NOT EXISTS todo_event_logs (
  id SERIAL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  group_id VARCHAR(100),
  group_name VARCHAR(255),
  task_id VARCHAR(100),
  task_name VARCHAR(255),
  changes TEXT,
  user_name VARCHAR(100),
  workspace VARCHAR(100),
  event_data JSONB,
  PRIMARY KEY (timestamp, id)
);

-- Convert to hypertable with 1-day chunks
SELECT create_hypertable(
  'todo_event_logs',
  'timestamp',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_event_type
  ON todo_event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_group_id
  ON todo_event_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_task_id
  ON todo_event_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_entity
  ON todo_event_logs(entity);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Auto-incrementing ID |
| timestamp | TIMESTAMPTZ | Event occurrence time (primary key component) |
| event_type | VARCHAR(50) | Type of event (see Event Types) |
| entity | VARCHAR(50) | Entity type (Group, Task, Comment) |
| entity_id | VARCHAR(100) | MongoDB ObjectId of entity |
| group_id | VARCHAR(100) | Associated group ID |
| group_name | VARCHAR(255) | Group name (denormalized) |
| task_id | VARCHAR(100) | Associated task ID (if applicable) |
| task_name | VARCHAR(255) | Task name (denormalized) |
| changes | TEXT | Human-readable change description |
| user_name | VARCHAR(100) | User who made the change |
| workspace | VARCHAR(100) | Workspace identifier |
| event_data | JSONB | Full event payload (flexible JSON) |

**Example Row:**
```json
{
  "id": 1234,
  "timestamp": "2024-01-15T14:30:00.000Z",
  "event_type": "STATUS_CHANGED",
  "entity": "Task",
  "entity_id": "507f191e810c19729de860ea",
  "group_id": "507f1f77bcf86cd799439011",
  "group_name": "Q1 2024 Projects",
  "task_id": "507f191e810c19729de860ea",
  "task_name": "Implement authentication",
  "changes": "Status changed from 'New' to 'In Progress'",
  "user_name": "Dhaya",
  "workspace": "default",
  "event_data": {
    "oldStatus": "New",
    "newStatus": "In Progress",
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

**Query Examples:**

```sql
-- Get all events for a group
SELECT * FROM todo_event_logs
WHERE group_id = '507f1f77bcf86cd799439011'
ORDER BY timestamp DESC
LIMIT 100;

-- Get all events for a task
SELECT * FROM todo_event_logs
WHERE task_id = '507f191e810c19729de860ea'
ORDER BY timestamp DESC;

-- Count events by type
SELECT event_type, COUNT(*) as count
FROM todo_event_logs
GROUP BY event_type;

-- Get recent activity (last 24 hours)
SELECT * FROM todo_event_logs
WHERE timestamp > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /api/auth/login
Login with username and password.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "Dhaya",
  "password": "Dhaya123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userId": "507f1f77bcf86cd799439011",
  "message": "Login successful"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Implementation:** [routes/auth.js](routes/auth.js)

---

#### GET /api/auth/users
Get list of all users (for testing).

**Response:**
```json
{
  "users": [
    {"_id": "...", "username": "Avinash"},
    {"_id": "...", "username": "Dhaya"}
  ]
}
```

---

### Group Management Endpoints

#### GET /api/groups
Get all groups with populated tasks.

**Response:**
```json
{
  "groups": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Q1 2024 Projects",
      "discussion": "First quarter tasks",
      "tasks": [
        {
          "_id": "507f191e810c19729de860ea",
          "name": "Implement authentication",
          "status": "In Progress",
          "commentCount": 3
        }
      ],
      "taskCount": 1,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

**Implementation:** [routes/groups.js](routes/groups.js:10-20)

---

#### POST /api/groups
Create a new group.

**Request:**
```http
POST /api/groups
Content-Type: application/json

{
  "name": "Q2 2024 Projects",
  "discussion": "Second quarter planning"
}
```

**Response:**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Q2 2024 Projects",
    "discussion": "Second quarter planning",
    "tasks": [],
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  },
  "message": "Group created successfully"
}
```

**Kafka Event:** `GROUP_CREATED`

**Implementation:** [routes/groups.js](routes/groups.js:23-50)

---

#### GET /api/groups/:groupId
Get a specific group with all tasks and comments.

**Response:**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Q1 2024 Projects",
    "discussion": "First quarter tasks",
    "tasks": [
      {
        "_id": "507f191e810c19729de860ea",
        "name": "Implement authentication",
        "description": "Add JWT authentication",
        "status": "In Progress",
        "startDate": "2024-01-10",
        "endDate": "2024-01-20",
        "comments": [
          {
            "_id": "607f191e810c19729de860ec",
            "text": "Started working on this",
            "timestamp": "2024-01-15T11:30:00.000Z"
          }
        ],
        "commentCount": 1
      }
    ],
    "taskCount": 1
  }
}
```

**Implementation:** [routes/groups.js](routes/groups.js:53-80)

---

#### PUT /api/groups/:groupId
Update group details.

**Request:**
```http
PUT /api/groups/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "Q1 2024 Updated",
  "discussion": "Updated discussion"
}
```

**Response:**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Q1 2024 Updated",
    "discussion": "Updated discussion",
    "updatedAt": "2024-01-15T16:00:00.000Z"
  },
  "message": "Group updated successfully"
}
```

**Kafka Event:** `GROUP_UPDATED`

**Change Tracking:** Detects changes in `name` and `discussion` fields.

**Implementation:** [routes/groups.js](routes/groups.js:83-140)

---

#### DELETE /api/groups/:groupId
Delete a group and cascade delete all associated tasks and comments.

**Response:**
```json
{
  "message": "Group and 5 tasks deleted successfully"
}
```

**Kafka Event:** `GROUP_DELETED`

**Cascade Behavior:**
1. Finds all tasks in the group
2. Deletes all comments for each task
3. Deletes all tasks
4. Deletes the group

**Implementation:** [routes/groups.js](routes/groups.js:143-180)

---

#### POST /api/groups/:groupId/tasks
Create a new task in a group.

**Request:**
```http
POST /api/groups/507f1f77bcf86cd799439011/tasks
Content-Type: application/json

{
  "name": "Setup CI/CD pipeline",
  "description": "Configure GitHub Actions",
  "status": "New",
  "startDate": "2024-01-20",
  "endDate": "2024-01-25"
}
```

**Response:**
```json
{
  "task": {
    "_id": "507f191e810c19729de860eb",
    "groupId": "507f1f77bcf86cd799439011",
    "name": "Setup CI/CD pipeline",
    "description": "Configure GitHub Actions",
    "status": "New",
    "startDate": "2024-01-20",
    "endDate": "2024-01-25",
    "comments": [],
    "createdAt": "2024-01-15T16:30:00.000Z",
    "updatedAt": "2024-01-15T16:30:00.000Z"
  },
  "message": "Task created successfully"
}
```

**Kafka Event:** `TASK_CREATED`

**Implementation:** [routes/groups.js](routes/groups.js:183-230)

---

### Task Management Endpoints

#### GET /api/tasks/:taskId
Get task details with comments.

**Response:**
```json
{
  "task": {
    "_id": "507f191e810c19729de860ea",
    "groupId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Q1 2024 Projects"
    },
    "name": "Implement authentication",
    "description": "Add JWT authentication",
    "status": "In Progress",
    "startDate": "2024-01-10",
    "endDate": "2024-01-20",
    "comments": [
      {
        "_id": "607f191e810c19729de860ec",
        "text": "Started working on this",
        "timestamp": "2024-01-15T11:30:00.000Z"
      }
    ],
    "commentCount": 1
  }
}
```

**Implementation:** [routes/tasks.js](routes/tasks.js:10-30)

---

#### PUT /api/tasks/:taskId
Update task details (name, description, dates).

**Request:**
```http
PUT /api/tasks/507f191e810c19729de860ea
Content-Type: application/json

{
  "name": "Implement JWT authentication",
  "description": "Add JWT with refresh tokens",
  "startDate": "2024-01-10",
  "endDate": "2024-01-22"
}
```

**Response:**
```json
{
  "task": {
    "_id": "507f191e810c19729de860ea",
    "name": "Implement JWT authentication",
    "description": "Add JWT with refresh tokens",
    "startDate": "2024-01-10",
    "endDate": "2024-01-22",
    "updatedAt": "2024-01-15T17:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

**Kafka Event:** `TASK_UPDATED`

**Change Tracking:** Detects changes in `name`, `description`, `startDate`, `endDate`.

**Implementation:** [routes/tasks.js](routes/tasks.js:33-110)

---

#### PUT /api/tasks/:taskId/status
Update task status.

**Request:**
```http
PUT /api/tasks/507f191e810c19729de860ea/status
Content-Type: application/json

{
  "status": "Completed"
}
```

**Response:**
```json
{
  "task": {
    "_id": "507f191e810c19729de860ea",
    "status": "Completed",
    "updatedAt": "2024-01-15T18:00:00.000Z"
  },
  "message": "Task status updated successfully"
}
```

**Kafka Event:** `STATUS_CHANGED`

**Valid Status Values:**
- New
- Backlog
- In Progress
- Completed
- Approved

**Implementation:** [routes/tasks.js](routes/tasks.js:113-160)

---

#### DELETE /api/tasks/:taskId
Delete a task and all its comments.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

**Kafka Event:** `TASK_DELETED`

**Cascade Behavior:**
1. Deletes all comments for the task
2. Removes task from group's tasks array
3. Deletes the task

**Implementation:** [routes/tasks.js](routes/tasks.js:163-210)

---

#### POST /api/tasks/:taskId/comments
Add a comment to a task.

**Request:**
```http
POST /api/tasks/507f191e810c19729de860ea/comments
Content-Type: application/json

{
  "text": "Added JWT library. Testing in progress."
}
```

**Response:**
```json
{
  "comment": {
    "_id": "607f191e810c19729de860ed",
    "taskId": "507f191e810c19729de860ea",
    "text": "Added JWT library. Testing in progress.",
    "timestamp": "2024-01-15T18:30:00.000Z"
  },
  "message": "Comment added successfully"
}
```

**Kafka Event:** `COMMENT_ADDED`

**Implementation:** [routes/tasks.js](routes/tasks.js:213-260)

---

#### GET /api/tasks/:taskId/comments
Get all comments for a task.

**Response:**
```json
{
  "comments": [
    {
      "_id": "607f191e810c19729de860ec",
      "taskId": "507f191e810c19729de860ea",
      "text": "Started working on this",
      "timestamp": "2024-01-15T11:30:00.000Z"
    },
    {
      "_id": "607f191e810c19729de860ed",
      "taskId": "507f191e810c19729de860ea",
      "text": "Added JWT library. Testing in progress.",
      "timestamp": "2024-01-15T18:30:00.000Z"
    }
  ]
}
```

**Implementation:** [routes/tasks.js](routes/tasks.js:263-280)

---

### Event Log Endpoints (TimescaleDB)

#### GET /api/logs/groups
Get all groups with event log counts.

**Response:**
```json
{
  "groups": [
    {
      "group_id": "507f1f77bcf86cd799439011",
      "group_name": "Q1 2024 Projects",
      "log_count": "47",
      "last_activity": "2024-01-15T18:30:00.000Z"
    }
  ]
}
```

**Query:** Aggregates event counts per group from TimescaleDB.

**Implementation:** [routes/logs.js](routes/logs.js:10-25)

---

#### GET /api/logs/group/:groupId
Get all event logs for a specific group.

**Query Parameters:**
- `limit`: Number of logs to return (default: 100)

**Response:**
```json
{
  "logs": [
    {
      "id": 1234,
      "timestamp": "2024-01-15T18:30:00.000Z",
      "event_type": "COMMENT_ADDED",
      "entity": "Comment",
      "entity_id": "607f191e810c19729de860ed",
      "group_id": "507f1f77bcf86cd799439011",
      "group_name": "Q1 2024 Projects",
      "task_id": "507f191e810c19729de860ea",
      "task_name": "Implement authentication",
      "changes": "Comment added: 'Added JWT library...'",
      "user_name": "Dhaya",
      "workspace": "default"
    }
  ]
}
```

**Implementation:** [routes/logs.js](routes/logs.js:28-42)

---

#### GET /api/logs/group/:groupId/tasks
Get task summary with log counts for a group.

**Response:**
```json
{
  "tasks": [
    {
      "task_id": "507f191e810c19729de860ea",
      "task_name": "Implement authentication",
      "log_count": "15",
      "last_activity": "2024-01-15T18:30:00.000Z"
    }
  ]
}
```

**Implementation:** [routes/logs.js](routes/logs.js:45-58)

---

#### GET /api/logs/task/:taskId
Get all event logs for a specific task.

**Query Parameters:**
- `limit`: Number of logs to return (default: 100)

**Response:**
```json
{
  "logs": [
    {
      "id": 1235,
      "timestamp": "2024-01-15T18:00:00.000Z",
      "event_type": "STATUS_CHANGED",
      "entity": "Task",
      "changes": "Status changed from 'In Progress' to 'Completed'",
      "user_name": "Dhaya"
    }
  ]
}
```

**Implementation:** [routes/logs.js](routes/logs.js:61-75)

---

## Kafka Event System

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KAFKA EVENT FLOW                          │
└─────────────────────────────────────────────────────────────┘

Express Route Handler
       │
       ├─→ Perform MongoDB Operation
       │
       ├─→ Send HTTP Response (200/201)
       │
       └─→ setImmediate(() => {
              Prepare Event Payload
              ↓
              kafkaProducer.publishEvent(...)
              ↓
              Kafka Broker (localhost:9092)
              ↓
              Topic: todo-history-events
           })

Note: Event publishing happens AFTER the HTTP response
      to avoid blocking the user request.
```

### Event Types

| Event Type | Trigger | Entity |
|------------|---------|--------|
| **GROUP_CREATED** | POST /api/groups | Group |
| **GROUP_UPDATED** | PUT /api/groups/:id | Group |
| **GROUP_DELETED** | DELETE /api/groups/:id | Group |
| **TASK_CREATED** | POST /api/groups/:id/tasks | Task |
| **TASK_UPDATED** | PUT /api/tasks/:id | Task |
| **STATUS_CHANGED** | PUT /api/tasks/:id/status | Task |
| **TASK_DELETED** | DELETE /api/tasks/:id | Task |
| **COMMENT_ADDED** | POST /api/tasks/:id/comments | Comment |

### Event Payload Structure

**Base Event Structure:**
```javascript
{
  eventType: 'TASK_UPDATED',
  payload: {
    entity: 'Task',              // Entity type
    entityId: '507f191e...',     // MongoDB ObjectId
    groupId: '507f1f77...',      // Associated group
    groupName: 'Q1 2024 Projects',
    taskId: '507f191e...',       // Task ID (if applicable)
    taskName: 'Implement auth',  // Task name (if applicable)
    changes: 'Task name changed from "X" to "Y"',  // Human-readable
    user: 'Dhaya',               // User who made the change
    workspace: 'default',        // Workspace identifier
    timestamp: '2024-01-15T18:00:00.000Z'
  }
}
```

### Event Examples

#### GROUP_CREATED Event
```javascript
{
  eventType: 'GROUP_CREATED',
  payload: {
    entity: 'Group',
    entityId: '507f1f77bcf86cd799439012',
    groupId: '507f1f77bcf86cd799439012',
    groupName: 'Q2 2024 Projects',
    changes: 'Group created: Q2 2024 Projects',
    user: 'Dhaya',
    workspace: 'default',
    timestamp: '2024-01-15T15:00:00.000Z'
  }
}
```

#### TASK_UPDATED Event
```javascript
{
  eventType: 'TASK_UPDATED',
  payload: {
    entity: 'Task',
    entityId: '507f191e810c19729de860ea',
    groupId: '507f1f77bcf86cd799439011',
    groupName: 'Q1 2024 Projects',
    taskId: '507f191e810c19729de860ea',
    taskName: 'Implement JWT authentication',
    changes: 'Task name changed from "Implement authentication" to "Implement JWT authentication", End date changed from "2024-01-20" to "2024-01-22"',
    user: 'Dhaya',
    workspace: 'default',
    timestamp: '2024-01-15T17:00:00.000Z'
  }
}
```

#### STATUS_CHANGED Event
```javascript
{
  eventType: 'STATUS_CHANGED',
  payload: {
    entity: 'Task',
    entityId: '507f191e810c19729de860ea',
    groupId: '507f1f77bcf86cd799439011',
    groupName: 'Q1 2024 Projects',
    taskId: '507f191e810c19729de860ea',
    taskName: 'Implement JWT authentication',
    changes: 'Status changed from "In Progress" to "Completed"',
    user: 'Dhaya',
    workspace: 'default',
    timestamp: '2024-01-15T18:00:00.000Z'
  }
}
```

#### COMMENT_ADDED Event
```javascript
{
  eventType: 'COMMENT_ADDED',
  payload: {
    entity: 'Comment',
    entityId: '607f191e810c19729de860ed',
    groupId: '507f1f77bcf86cd799439011',
    groupName: 'Q1 2024 Projects',
    taskId: '507f191e810c19729de860ea',
    taskName: 'Implement JWT authentication',
    changes: 'Comment added: "Added JWT library. Testing in progress."',
    user: 'Dhaya',
    workspace: 'default',
    timestamp: '2024-01-15T18:30:00.000Z'
  }
}
```

### Kafka Configuration

**Producer Configuration** ([kafka/producer.js](kafka/producer.js))

```javascript
{
  clientId: 'todo-backend',
  brokers: ['localhost:9092'],
  connectionTimeout: 3000,
  requestTimeout: 25000,
  retry: {
    retries: 3,
    initialRetryTime: 100,
    maxRetryTime: 30000
  }
}
```

**Topic Configuration:**
- **Topic Name:** `todo-history-events`
- **Partitions:** Auto-created
- **Replication Factor:** 1 (single broker)
- **Retention:** Default Kafka retention

### Error Handling

**Kafka Unavailable:**
- Events fail silently (logged to console)
- HTTP response is NOT affected
- System continues to function without event logging

**Publishing Strategy:**
```javascript
setImmediate(async () => {
  try {
    await kafkaProducer.publishEvent(eventType, payload);
  } catch (error) {
    console.error('Failed to publish event:', error);
    // Do not throw - graceful degradation
  }
});
```

### Consumer Architecture

**Note:** The Node.js consumer (`kafka/consumer.js`) is DEPRECATED.

**Active Consumer:** Go-based consumer service
- Reads from `todo-history-events` topic
- Processes events
- Writes to TimescaleDB
- Handles backpressure and retries

---

## Configuration

### Environment Variables

**File:** [.env](.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
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

### Connection Strings

#### MongoDB Atlas
```
mongodb+srv://dhayalesh25_db_user:MTAAJwvayo6dhBKC@todo.v4defom.mongodb.net/?appName=todo
```

**Cluster:** `todo.v4defom.mongodb.net`
**User:** `dhayalesh25_db_user`
**Database:** Auto-selected by cluster

#### Local MongoDB (Fallback)
```
mongodb://localhost:27017/todo_manager
```

#### TimescaleDB (PostgreSQL)
```
postgresql://postgres:postgres@localhost:5432/todo_history
```

**Connection Pool:**
- Max: 20 connections
- Idle timeout: 30s
- Connection timeout: 2s

### Port Allocation

| Service | Port | Protocol |
|---------|------|----------|
| Express Server | 3001 | HTTP |
| MongoDB Atlas | 27017 | MongoDB Protocol |
| Kafka Broker | 9092 | Kafka Protocol |
| TimescaleDB | 5432 | PostgreSQL Protocol |

---

## Setup & Installation

### Prerequisites

1. **Node.js**: v16+ recommended
2. **MongoDB**: Atlas account OR local installation
3. **Apache Kafka**: Local broker running on port 9092
4. **PostgreSQL with TimescaleDB**: Local installation
5. **Go**: For running the consumer service

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd c:\Users\bdhayalesh\Desktop\KTern\kafka\todo_serer

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Update MongoDB URI, Kafka broker, TimescaleDB credentials
```

### Step 3: Setup Databases

**MongoDB:**
- Create a MongoDB Atlas cluster OR
- Install MongoDB locally
- Database will be created automatically on first connection

**TimescaleDB:**
```bash
# Install PostgreSQL and TimescaleDB extension
# Create database
createdb todo_history

# Connect and enable TimescaleDB
psql -d todo_history
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

**Initialize TimescaleDB schema:**
```bash
# The application will auto-create tables on startup
# Or run manually:
node -e "require('./db/timescale').initializeDatabase()"
```

### Step 4: Start Kafka

```bash
# Start Zookeeper
zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka broker
kafka-server-start.sh config/server.properties

# Verify broker is running
kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Step 5: Start Services

**Start Todo Server:**
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

**Start Go Consumer (separate terminal):**
```bash
cd ../go-consumer
go run main.go
```

### Step 6: Verify Installation

**Check server health:**
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Todo Manager API is running"
}
```

**Check default users:**
```bash
curl http://localhost:3001/api/auth/users
```

### Step 7: Run Tests

```bash
# Basic API tests
npm test

# Enhanced event tracking tests
npm run test-events
```

---

## Code Components

### Main Application Entry Point

**File:** [index.js](index.js)

**Responsibilities:**
1. Load environment variables
2. Initialize Express app
3. Connect to MongoDB
4. Initialize Kafka producer
5. Seed default users
6. Register API routes
7. Start HTTP server

**Key Code:**
```javascript
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Kafka Initialization
const kafkaProducer = new KafkaProducer();
await kafkaProducer.connect();

// Middleware
app.use(cors({origin: '*', credentials: true}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Kafka Producer

**File:** [kafka/producer.js](kafka/producer.js)

**Class:** `KafkaProducer` (Singleton)

**Methods:**

1. **`connect()`** - Initialize Kafka connection
   ```javascript
   async connect() {
     await this.producer.connect();
     console.log('✓ Kafka producer connected');
   }
   ```

2. **`publishEvent(eventType, payload)`** - Publish event to Kafka
   ```javascript
   async publishEvent(eventType, payload) {
     await this.producer.send({
       topic: process.env.KAFKA_TOPIC,
       messages: [{
         key: payload.entityId,
         value: JSON.stringify({eventType, payload})
       }]
     });
   }
   ```

3. **`disconnect()`** - Close Kafka connection
   ```javascript
   async disconnect() {
     await this.producer.disconnect();
   }
   ```

**Usage Pattern:**
```javascript
// In route handler (after sending HTTP response)
setImmediate(async () => {
  try {
    await kafkaProducer.publishEvent('TASK_CREATED', {
      entity: 'Task',
      entityId: task._id.toString(),
      groupId: group._id.toString(),
      groupName: group.name,
      taskName: task.name,
      changes: `Task created: ${task.name}`,
      user: 'Dhaya',
      workspace: 'default',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Kafka publish error:', error);
  }
});
```

### TimescaleDB Integration

**File:** [db/timescale.js](db/timescale.js)

**Key Functions:**

1. **`initializeDatabase()`** - Create tables and indexes
   ```javascript
   async function initializeDatabase() {
     // Create table
     await pool.query(CREATE_TABLE_SQL);
     // Create hypertable
     await pool.query(CREATE_HYPERTABLE_SQL);
     // Create indexes
     await pool.query(CREATE_INDEXES_SQL);
   }
   ```

2. **`insertEventLog(eventData)`** - Insert event log
   ```javascript
   async function insertEventLog(eventData) {
     const query = `
       INSERT INTO todo_event_logs
       (timestamp, event_type, entity, entity_id, ...)
       VALUES ($1, $2, $3, $4, ...)
     `;
     await pool.query(query, values);
   }
   ```

3. **`getGroupLogs(groupId, limit)`** - Get logs for group
   ```javascript
   async function getGroupLogs(groupId, limit = 100) {
     const query = `
       SELECT * FROM todo_event_logs
       WHERE group_id = $1
       ORDER BY timestamp DESC
       LIMIT $2
     `;
     return await pool.query(query, [groupId, limit]);
   }
   ```

4. **`getGroupsSummary()`** - Get all groups with log counts
   ```javascript
   async function getGroupsSummary() {
     const query = `
       SELECT
         group_id,
         group_name,
         COUNT(*) as log_count,
         MAX(timestamp) as last_activity
       FROM todo_event_logs
       WHERE group_id IS NOT NULL
       GROUP BY group_id, group_name
       ORDER BY last_activity DESC
     `;
     return await pool.query(query);
   }
   ```

### User Seeding

**File:** [db/seedUsers.js](db/seedUsers.js)

**Function:** `seedUsers()`

**Default Users:**
```javascript
const defaultUsers = [
  { username: 'Avinash', password: 'Avinash123' },
  { username: 'Dhaya', password: 'Dhaya123' },
  { username: 'Ashok', password: 'Ashok123' },
  { username: 'Arun', password: 'Arun123' },
  { username: 'Cathrine', password: 'Cathrine123' }
];
```

**Logic:**
```javascript
async function seedUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany(defaultUsers);
    console.log('✓ Default users seeded');
  }
}
```

### Change Detection Logic

**Pattern used in route handlers:**

```javascript
// Example: Detecting task updates
const changes = [];

if (req.body.name && req.body.name !== task.name) {
  changes.push(
    `Task name changed from "${task.name}" to "${req.body.name}"`
  );
}

if (req.body.description &&
    req.body.description !== task.description) {
  changes.push(
    `Description changed from "${task.description}" to "${req.body.description}"`
  );
}

const changesText = changes.length > 0
  ? changes.join(', ')
  : 'Task updated';

// Publish event with changes
await kafkaProducer.publishEvent('TASK_UPDATED', {
  ...payload,
  changes: changesText
});
```

---

## Security Considerations

### Current Security Issues

⚠️ **CRITICAL ISSUES:**

1. **Plain Text Passwords**
   - Location: [models/User.js](models/User.js)
   - Issue: Passwords stored without hashing
   - Risk: HIGH - Database compromise exposes all passwords
   - Solution: Use bcrypt or argon2 for password hashing

2. **No Authentication Middleware**
   - Issue: No JWT or session-based auth
   - Risk: MEDIUM - Any client can access any endpoint
   - Solution: Implement JWT tokens with middleware

3. **No Input Validation**
   - Issue: Request bodies not validated
   - Risk: MEDIUM - Potential for injection attacks
   - Solution: Use express-validator or Joi

4. **CORS Wide Open**
   - Location: [index.js](index.js)
   - Config: `origin: '*'`
   - Risk: LOW - Any domain can access API
   - Solution: Restrict to specific origins

5. **MongoDB Connection String in .env**
   - Location: [.env](.env)
   - Issue: Credentials visible in plain text
   - Risk: HIGH - Repository exposure leaks database access
   - Solution: Use secrets manager (AWS Secrets Manager, Azure Key Vault)

6. **No Rate Limiting**
   - Issue: No protection against abuse
   - Risk: MEDIUM - Vulnerable to DoS
   - Solution: Use express-rate-limit

7. **No Request Size Limits**
   - Issue: Can send unlimited payload size
   - Risk: MEDIUM - Potential DoS via large payloads
   - Solution: Configure body-parser limits

### Recommended Security Improvements

**1. Implement Password Hashing:**
```javascript
const bcrypt = require('bcrypt');

// Hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const match = await bcrypt.compare(password, user.password);
```

**2. Add JWT Authentication:**
```javascript
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}
```

**3. Add Input Validation:**
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/groups', [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('discussion').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... continue
});
```

**4. Restrict CORS:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

**5. Add Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**6. Use Environment Secrets:**
```javascript
// Use AWS Secrets Manager, Azure Key Vault, or similar
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getMongoUri() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'todo-server/mongodb-uri'
  }).promise();
  return JSON.parse(secret.SecretString).uri;
}
```

---

## Testing

### Test Files

#### 1. Basic API Tests

**File:** [test-api.js](test-api.js)

**Test Scenario:**
1. Create a new group
2. Create a task in that group
3. Add a comment to the task
4. Retrieve the group with all data
5. Cleanup (optional)

**Run:**
```bash
npm test
```

#### 2. Enhanced Event Tracking Tests

**File:** [test-enhanced-events.js](test-enhanced-events.js)

**Test Scenario:**
1. Create a group
2. Create multiple tasks
3. Update task details (name, description, dates)
4. Change task status
5. Add comments
6. Update group details
7. Verify all events are published

**Run:**
```bash
npm run test-events
```

### Manual Testing

**Using cURL:**

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Dhaya","password":"Dhaya123"}'

# Create group
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","discussion":"Testing"}'

# Get groups
curl http://localhost:3001/api/groups

# Create task
curl -X POST http://localhost:3001/api/groups/GROUP_ID/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Task","status":"New"}'

# Update task status
curl -X PUT http://localhost:3001/api/tasks/TASK_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'

# Get logs
curl http://localhost:3001/api/logs/groups
curl http://localhost:3001/api/logs/group/GROUP_ID
curl http://localhost:3001/api/logs/task/TASK_ID
```

**Using Postman:**

Import these endpoints as a Postman collection:

```json
{
  "info": {
    "name": "Todo Server API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/health"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"Dhaya\",\"password\":\"Dhaya123\"}"
        }
      }
    },
    {
      "name": "Create Group",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/groups",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Q1 2024\",\"discussion\":\"First quarter\"}"
        }
      }
    }
  ]
}
```

### Testing Kafka Events

**1. Console Consumer:**
```bash
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --from-beginning \
  --formatter kafka.tools.DefaultMessageFormatter \
  --property print.key=true \
  --property print.value=true
```

**2. Verify TimescaleDB:**
```sql
-- Connect to TimescaleDB
psql -d todo_history -U postgres

-- Check event counts
SELECT event_type, COUNT(*)
FROM todo_event_logs
GROUP BY event_type;

-- View recent events
SELECT
  timestamp,
  event_type,
  group_name,
  task_name,
  changes
FROM todo_event_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Check hypertable info
SELECT * FROM timescaledb_information.hypertables;
```

---

## Appendix

### Common Issues & Solutions

**Issue:** MongoDB connection fails
```
Solution: Check MONGODB_URI in .env, verify Atlas cluster is running
```

**Issue:** Kafka connection timeout
```
Solution: Ensure Kafka broker is running on port 9092
$ kafka-server-start.sh config/server.properties
```

**Issue:** TimescaleDB connection refused
```
Solution: Check PostgreSQL is running and TimescaleDB extension is enabled
$ psql -d todo_history
todo_history=# CREATE EXTENSION IF NOT EXISTS timescaledb;
```

**Issue:** Go consumer not processing events
```
Solution: Verify Go consumer is running and connected to correct Kafka topic
$ go run main.go
```

**Issue:** Events published but not in TimescaleDB
```
Solution: Check Go consumer logs for errors, verify TimescaleDB credentials
```

### Performance Considerations

**MongoDB:**
- Add indexes on frequently queried fields (groupId, status)
- Use `.lean()` for read-only queries
- Implement pagination for large result sets

**Kafka:**
- Consider increasing partition count for higher throughput
- Adjust batch settings for producer
- Monitor consumer lag

**TimescaleDB:**
- Default 1-day chunk size is suitable for most workloads
- Add indexes on commonly filtered columns (event_type, group_id)
- Implement data retention policies for old events
- Use continuous aggregates for analytics queries

### Scaling Recommendations

**Horizontal Scaling:**
1. Run multiple Express instances behind a load balancer
2. Use sticky sessions if needed
3. Increase Kafka partitions to match instance count
4. Scale Go consumers accordingly

**Database Optimization:**
1. MongoDB Atlas auto-scaling (M10+ clusters)
2. TimescaleDB read replicas for analytics
3. Redis cache for frequently accessed data

**Monitoring:**
1. Application metrics: PM2, New Relic
2. Kafka monitoring: Kafka Manager, Confluent Control Center
3. Database monitoring: MongoDB Atlas metrics, pg_stat_statements

---

## Version Information

**Application Version:** Not specified in package.json

**Technology Versions:**
- Node.js: v16+ (recommended)
- Express: 5.1.0
- MongoDB: 6.20.0
- Mongoose: 8.19.3
- KafkaJS: 2.2.4
- PostgreSQL: 8.11.3
- TimescaleDB: Latest (via extension)

**Last Updated:** 2025-01-15

---

## Contact & Support

**Project Location:**
```
C:\Users\bdhayalesh\Desktop\KTern\kafka\todo_serer
```

**Key Configuration Files:**
- [.env](.env) - Environment configuration
- [package.json](package.json) - Dependencies
- [README.md](README.md) - Basic documentation

**Related Services:**
- Go Consumer: `../go-consumer/`
- Kafka Setup: `../docker-compose.yml`

---

**End of Documentation**

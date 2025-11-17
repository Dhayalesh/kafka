# Docker Infrastructure - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Services Summary](#services-summary)
4. [Container Details](#container-details)
5. [Docker Images](#docker-images)
6. [Networking](#networking)
7. [Volume Management](#volume-management)
8. [Environment Variables](#environment-variables)
9. [Port Mappings](#port-mappings)
10. [Getting Started](#getting-started)
11. [Container Management](#container-management)
12. [Monitoring & Management UIs](#monitoring--management-uis)
13. [Data Persistence](#data-persistence)
14. [Troubleshooting](#troubleshooting)
15. [Performance Tuning](#performance-tuning)
16. [Security Considerations](#security-considerations)
17. [Backup & Recovery](#backup--recovery)

---

## Overview

This Docker Compose setup provides the complete infrastructure for the Todo application ecosystem. It orchestrates 5 containerized services that work together to provide message streaming, time-series data storage, and management interfaces.

**File Location:** `C:\Users\bdhayalesh\Desktop\KTern\kafka\docker-compose.yml`

### Infrastructure Stack

```
┌─────────────────────────────────────────────────────────┐
│              Docker Infrastructure Stack                 │
└─────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Zookeeper   │  │    Kafka     │  │ TimescaleDB  │
│  Port 2181   │  │  Port 9092   │  │  Port 5432   │
│              │  │  Port 29092  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
      Core Infrastructure Services

┌──────────────┐  ┌──────────────┐
│   Adminer    │  │   Kafdrop    │
│  Port 8080   │  │  Port 9000   │
└──────────────┘  └──────────────┘
    Management & Monitoring UIs
```

### Key Features

- **Message Streaming**: Apache Kafka for event-driven architecture
- **Time-Series Storage**: TimescaleDB for historical event logs
- **Coordination**: Zookeeper for Kafka cluster management
- **Database UI**: Adminer for TimescaleDB administration
- **Kafka UI**: Kafdrop for Kafka monitoring and management
- **Data Persistence**: Named volumes for all stateful services
- **Health Management**: Automatic restart policies
- **Network Isolation**: Services communicate via Docker internal network

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE STACK                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     SERVICE DEPENDENCIES                         │  │
│  │                                                                  │  │
│  │            ┌─────────────┐                                       │  │
│  │            │  Zookeeper  │                                       │  │
│  │            │  :2181      │                                       │  │
│  │            └──────┬──────┘                                       │  │
│  │                   │                                              │  │
│  │                   │ Coordination                                 │  │
│  │                   │                                              │  │
│  │            ┌──────▼──────┐         ┌──────────────┐             │  │
│  │            │    Kafka    │         │ TimescaleDB  │             │  │
│  │            │  :9092      │         │   :5432      │             │  │
│  │            │  :29092     │         │              │             │  │
│  │            └──────┬──────┘         └──────┬───────┘             │  │
│  │                   │                       │                     │  │
│  │            ┌──────▼──────┐         ┌──────▼───────┐             │  │
│  │            │   Kafdrop   │         │   Adminer    │             │  │
│  │            │   :9000     │         │    :8080     │             │  │
│  │            └─────────────┘         └──────────────┘             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       VOLUME MOUNTS                              │  │
│  │                                                                  │  │
│  │  zookeeper-data    ──→  /var/lib/zookeeper/data                 │  │
│  │  zookeeper-log     ──→  /var/lib/zookeeper/log                  │  │
│  │  kafka-data        ──→  /var/lib/kafka/data                     │  │
│  │  timescaledb-data  ──→  /var/lib/postgresql/data                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       PORT MAPPINGS                              │  │
│  │                                                                  │  │
│  │  localhost:2181  ──→  Zookeeper                                  │  │
│  │  localhost:9092  ──→  Kafka (External Access)                    │  │
│  │  localhost:29092 ──→  Kafka (Docker Internal)                    │  │
│  │  localhost:5432  ──→  TimescaleDB                                │  │
│  │  localhost:8080  ──→  Adminer (Database UI)                      │  │
│  │  localhost:9000  ──→  Kafdrop (Kafka UI)                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

                              ▼
                    ┌─────────────────┐
                    │  Host Machine   │
                    │  Applications   │
                    └─────────────────┘
                    - Go Consumer
                    - Express.js Backend
                    - React Frontend
```

---

## Services Summary

| Service | Image | Version | Role | Ports | Status |
|---------|-------|---------|------|-------|--------|
| **Zookeeper** | confluentinc/cp-zookeeper | 7.6.1 | Kafka coordination | 2181 | Required |
| **Kafka** | confluentinc/cp-kafka | 7.6.1 | Message broker | 9092, 29092 | Required |
| **TimescaleDB** | timescale/timescaledb | latest-pg16 | Time-series DB | 5432 | Required |
| **Adminer** | adminer | latest | DB management UI | 8080 | Optional |
| **Kafdrop** | obsidiandynamics/kafdrop | latest | Kafka monitoring UI | 9000 | Optional |

### Service Categories

**Core Infrastructure** (Required for application):
- Zookeeper
- Kafka
- TimescaleDB

**Management Tools** (Optional, for monitoring/debugging):
- Adminer
- Kafdrop

---

## Container Details

### 1. Zookeeper Container

**Purpose:** Coordination service for Kafka cluster

**Container Name:** `zookeeper`

**Image Details:**
- **Repository:** confluentinc/cp-zookeeper
- **Tag:** 7.6.1
- **Maintainer:** Confluent Inc.
- **Base:** OpenJDK on Debian
- **Size:** ~300 MB (compressed)

**What is Zookeeper?**
Apache Zookeeper is a centralized service for maintaining configuration information, naming, providing distributed synchronization, and providing group services. In Kafka architecture, it manages:
- Broker metadata
- Topic configurations
- Partition leadership
- Consumer group coordination

**Container Configuration:**

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

**Environment Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| ZOOKEEPER_CLIENT_PORT | 2181 | Port for client connections |
| ZOOKEEPER_TICK_TIME | 2000 | Basic time unit in milliseconds |

**Port Mapping:**
- **2181:2181** - Zookeeper client port (host:container)

**Volumes:**
- **zookeeper-data** → `/var/lib/zookeeper/data` - Stores Zookeeper state
- **zookeeper-log** → `/var/lib/zookeeper/log` - Transaction logs

**Resource Usage:**
- CPU: Low (~1-5%)
- Memory: ~256 MB - 512 MB
- Disk: Minimal (~100 MB with data)

**Health Check:**
```bash
# Check if Zookeeper is running
docker exec zookeeper bash -c "echo stat | nc localhost 2181"

# Expected output: Zookeeper version info
```

**When to Scale:**
- Single instance sufficient for development
- Production: 3-5 instances for high availability

---

### 2. Kafka Container

**Purpose:** Distributed message streaming platform

**Container Name:** `kafka`

**Image Details:**
- **Repository:** confluentinc/cp-kafka
- **Tag:** 7.6.1
- **Maintainer:** Confluent Inc.
- **Base:** OpenJDK on Debian
- **Size:** ~600 MB (compressed)

**What is Kafka?**
Apache Kafka is a distributed event streaming platform used for:
- Real-time data pipelines
- Event-driven applications
- Message brokering between services
- Event sourcing and logging

**In this application:**
- Receives events from Express.js backend
- Streams events to Go consumer
- Topic: `todo-history-events`

**Container Configuration:**

```yaml
kafka:
  image: confluentinc/cp-kafka:7.6.1
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"
    - "29092:29092"
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,DOCKER://0.0.0.0:29092
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,DOCKER://kafka:29092
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,DOCKER:PLAINTEXT
    KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
  volumes:
    - kafka-data:/var/lib/kafka/data
```

**Environment Variables Explained:**

| Variable | Value | Description |
|----------|-------|-------------|
| KAFKA_BROKER_ID | 1 | Unique ID for this broker |
| KAFKA_ZOOKEEPER_CONNECT | zookeeper:2181 | Zookeeper connection string |
| KAFKA_LISTENERS | PLAINTEXT://0.0.0.0:9092,<br>DOCKER://0.0.0.0:29092 | Listener addresses |
| KAFKA_ADVERTISED_LISTENERS | PLAINTEXT://localhost:9092,<br>DOCKER://kafka:29092 | Advertised addresses for clients |
| KAFKA_LISTENER_SECURITY_PROTOCOL_MAP | PLAINTEXT:PLAINTEXT,<br>DOCKER:PLAINTEXT | Protocol mapping |
| KAFKA_INTER_BROKER_LISTENER_NAME | PLAINTEXT | Broker-to-broker communication |
| KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR | 1 | Offset topic replication |
| KAFKA_TRANSACTION_STATE_LOG_MIN_ISR | 1 | Transaction log ISR |
| KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR | 1 | Transaction replication |
| KAFKA_AUTO_CREATE_TOPICS_ENABLE | "true" | Auto-create topics on first publish |

**Dual Listener Configuration:**

Kafka is configured with two listeners for different access patterns:

```
PLAINTEXT://localhost:9092  ──→  For host machine applications
DOCKER://kafka:29092        ──→  For Docker container applications
```

**Why Two Listeners?**

1. **PLAINTEXT (Port 9092)**:
   - Used by: Go consumer, Express.js backend (running on host)
   - Address: `localhost:9092`
   - Access from: Host machine

2. **DOCKER (Port 29092)**:
   - Used by: Kafdrop (running in Docker)
   - Address: `kafka:29092`
   - Access from: Other Docker containers

**Port Mapping:**
- **9092:9092** - External access from host
- **29092:29092** - Internal Docker network access

**Volumes:**
- **kafka-data** → `/var/lib/kafka/data` - Message logs and topic data

**Resource Usage:**
- CPU: Medium (~10-30%)
- Memory: ~1 GB - 2 GB
- Disk: Grows with message volume

**Health Check:**
```bash
# Check Kafka broker
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# List topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

**Topics Used:**
- `todo-history-events` - Main event stream for application

---

### 3. TimescaleDB Container

**Purpose:** Time-series optimized PostgreSQL database

**Container Name:** `timescaledb`

**Image Details:**
- **Repository:** timescale/timescaledb
- **Tag:** latest-pg16
- **Base:** PostgreSQL 16
- **Extension:** TimescaleDB extension pre-installed
- **Size:** ~200 MB (compressed)

**What is TimescaleDB?**
TimescaleDB is an open-source time-series database built on PostgreSQL. It provides:
- Automatic partitioning by time (hypertables)
- High-performance time-series queries
- Full SQL support
- PostgreSQL ecosystem compatibility

**In this application:**
- Stores event logs from Kafka consumer
- Provides historical data for analytics
- Serves log queries via Express.js API

**Container Configuration:**

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

**Environment Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| POSTGRES_USER | postgres | Superuser username |
| POSTGRES_PASSWORD | postgres | Superuser password |
| POSTGRES_DB | todo_history | Default database created on init |

**Port Mapping:**
- **5432:5432** - PostgreSQL/TimescaleDB port

**Volumes:**
- **timescaledb-data** → `/var/lib/postgresql/data` - Database files

**Database Schema:**
- Database: `todo_history`
- Table: `todo_event_logs` (hypertable)
- Partitioning: By timestamp (1-day chunks)

**Restart Policy:**
- **always** - Container automatically restarts if it stops

**Resource Usage:**
- CPU: Low to Medium (~5-20%)
- Memory: ~256 MB - 1 GB
- Disk: Grows with event data

**Health Check:**
```bash
# Check if PostgreSQL is accepting connections
docker exec timescaledb pg_isready -U postgres

# Connect to database
docker exec -it timescaledb psql -U postgres -d todo_history

# Check TimescaleDB extension
docker exec timescaledb psql -U postgres -d todo_history -c "SELECT * FROM timescaledb_information.hypertables;"
```

**Default Credentials:**
```
Host: localhost
Port: 5432
Username: postgres
Password: postgres
Database: todo_history
```

---

### 4. Adminer Container

**Purpose:** Web-based database management interface

**Container Name:** `adminer`

**Image Details:**
- **Repository:** adminer
- **Tag:** latest
- **Base:** PHP + Apache
- **Size:** ~90 MB (compressed)

**What is Adminer?**
Adminer (formerly phpMinAdmin) is a lightweight database management tool written in PHP. It supports:
- PostgreSQL, MySQL, SQLite, MongoDB, and more
- Single PHP file deployment
- Modern UI with responsive design
- SQL query execution
- Database export/import

**In this application:**
- Provides GUI access to TimescaleDB
- Browse and query `todo_event_logs` table
- Useful for debugging and data inspection

**Container Configuration:**

```yaml
adminer:
  image: adminer:latest
  container_name: adminer
  restart: always
  depends_on:
    - timescaledb
  ports:
    - "8080:8080"
```

**Port Mapping:**
- **8080:8080** - Adminer web interface

**Depends On:**
- **timescaledb** - Ensures database is running first

**Restart Policy:**
- **always** - Container automatically restarts

**Resource Usage:**
- CPU: Very Low (~1%)
- Memory: ~50 MB
- Disk: Minimal

**Access:**
```
URL: http://localhost:8080
```

**Login Details:**
```
System: PostgreSQL
Server: timescaledb
Username: postgres
Password: postgres
Database: todo_history
```

**Features:**
- Browse tables and data
- Execute SQL queries
- Export data (CSV, SQL)
- Manage indexes
- View table structure

---

### 5. Kafdrop Container

**Purpose:** Web UI for monitoring Apache Kafka

**Container Name:** `kafdrop`

**Image Details:**
- **Repository:** obsidiandynamics/kafdrop
- **Tag:** latest
- **Base:** Java (JDK)
- **Size:** ~150 MB (compressed)

**What is Kafdrop?**
Kafdrop is a web-based UI for viewing Kafka topics and browsing consumer groups. It provides:
- Topic browsing
- Message inspection
- Consumer group monitoring
- Broker information
- Partition details

**In this application:**
- Monitor `todo-history-events` topic
- View messages published by Express.js
- Check consumer group status
- Debug message flow

**Container Configuration:**

```yaml
kafdrop:
  image: obsidiandynamics/kafdrop
  container_name: kafdrop
  depends_on:
    - kafka
  ports:
    - "9000:9000"
  environment:
    KAFKA_BROKERCONNECT: "kafka:29092"
    JVM_OPTS: "-Xms32M -Xmx64M"
    SERVER_PORT: 9000
```

**Environment Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| KAFKA_BROKERCONNECT | kafka:29092 | Kafka broker address (Docker internal) |
| JVM_OPTS | -Xms32M -Xmx64M | Java memory settings |
| SERVER_PORT | 9000 | Web server port |

**Why kafka:29092?**
Kafdrop runs inside Docker network, so it uses the internal Docker listener (29092) instead of the host listener (9092).

**Port Mapping:**
- **9000:9000** - Kafdrop web interface

**Depends On:**
- **kafka** - Ensures Kafka is running first

**Resource Usage:**
- CPU: Low (~2-5%)
- Memory: 64 MB (configured via JVM_OPTS)
- Disk: Minimal

**Access:**
```
URL: http://localhost:9000
```

**Features:**
- Browse all topics
- View topic details (partitions, replication)
- Inspect individual messages
- View consumer groups and lag
- Search messages
- Export messages

**Useful For:**
- Verifying events are published
- Debugging message format
- Monitoring consumer lag
- Testing Kafka connectivity

---

## Docker Images

### Image Details & Versions

#### 1. confluentinc/cp-zookeeper:7.6.1

**Official:** Yes (Confluent Platform)
**Size:** ~300 MB
**Base Image:** openjdk:11-jre-slim
**Architecture:** amd64, arm64

**Included Components:**
- Apache Zookeeper 3.8.x
- Confluent Platform utilities
- JMX monitoring tools

**Official Docs:** https://docs.confluent.io/platform/current/installation/docker/image-reference.html

**Pull Command:**
```bash
docker pull confluentinc/cp-zookeeper:7.6.1
```

**Image Layers:**
- Base OS (Debian)
- OpenJDK 11 JRE
- Zookeeper binaries
- Confluent scripts

---

#### 2. confluentinc/cp-kafka:7.6.1

**Official:** Yes (Confluent Platform)
**Size:** ~600 MB
**Base Image:** openjdk:11-jre-slim
**Architecture:** amd64, arm64

**Included Components:**
- Apache Kafka 3.6.x
- Confluent Platform tools
- Kafka Connect
- Schema Registry clients

**Official Docs:** https://docs.confluent.io/platform/current/installation/docker/config-reference.html

**Pull Command:**
```bash
docker pull confluentinc/cp-kafka:7.6.1
```

**Kafka Version:** 3.6.x (included in Confluent Platform 7.6.1)

**Image Layers:**
- Base OS (Debian)
- OpenJDK 11 JRE
- Kafka binaries
- Confluent scripts

---

#### 3. timescale/timescaledb:latest-pg16

**Official:** Yes (Timescale Inc.)
**Size:** ~200 MB
**Base Image:** postgres:16-alpine
**Architecture:** amd64, arm64

**Included Components:**
- PostgreSQL 16
- TimescaleDB extension
- PostGIS support
- PostgreSQL contrib modules

**Official Docs:** https://docs.timescale.com/self-hosted/latest/install/installation-docker/

**Pull Command:**
```bash
docker pull timescale/timescaledb:latest-pg16
```

**TimescaleDB Version:** 2.14+ (latest)
**PostgreSQL Version:** 16.x

**Image Layers:**
- Alpine Linux
- PostgreSQL 16
- TimescaleDB extension
- Configuration scripts

---

#### 4. adminer:latest

**Official:** Yes
**Size:** ~90 MB
**Base Image:** php:alpine
**Architecture:** amd64, arm64, arm/v7

**Included Components:**
- PHP 8.x
- Apache/FPM
- Adminer application (single PHP file)
- Database drivers (PostgreSQL, MySQL, SQLite)

**Official Docs:** https://hub.docker.com/_/adminer

**Pull Command:**
```bash
docker pull adminer:latest
```

**Adminer Version:** 4.8.1+

**Image Layers:**
- Alpine Linux
- PHP runtime
- Web server
- Adminer application

---

#### 5. obsidiandynamics/kafdrop:latest

**Official:** Community-maintained
**Size:** ~150 MB
**Base Image:** openjdk:11-jre-slim
**Architecture:** amd64

**Included Components:**
- Java JRE 11
- Kafdrop web application
- Kafka client libraries
- Spring Boot

**Official Docs:** https://github.com/obsidiandynamics/kafdrop

**Pull Command:**
```bash
docker pull obsidiandynamics/kafdrop:latest
```

**Kafdrop Version:** 3.x+

**Image Layers:**
- Debian
- OpenJDK 11 JRE
- Kafdrop JAR
- Configuration files

---

## Networking

### Docker Network Configuration

**Default Network:** Bridge network (auto-created by Docker Compose)

**Network Name:** `kafka_default` (based on directory name)

### Service Communication

**Internal Communication (Container to Container):**

```
┌─────────────────────────────────────────────┐
│         Docker Internal Network             │
│         (kafka_default)                     │
│                                             │
│  kafka:29092      ←→   kafdrop:9000        │
│  zookeeper:2181   ←→   kafka:9092          │
│  timescaledb:5432 ←→   adminer:8080        │
│                                             │
└─────────────────────────────────────────────┘
```

**Services use hostnames instead of IPs:**
- `zookeeper:2181` - Zookeeper client port
- `kafka:29092` - Kafka internal listener
- `timescaledb:5432` - PostgreSQL port

**External Access (Host to Container):**

```
┌─────────────────────────────────────────────┐
│         Host Machine (localhost)            │
│                                             │
│  localhost:2181   ──→  Zookeeper            │
│  localhost:9092   ──→  Kafka                │
│  localhost:5432   ──→  TimescaleDB          │
│  localhost:8080   ──→  Adminer              │
│  localhost:9000   ──→  Kafdrop              │
│                                             │
└─────────────────────────────────────────────┘
```

**Network Diagram:**

```
┌────────────────────────────────────────────────────┐
│                  HOST NETWORK                      │
│                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Go Consumer │  │  Express.js │  │  Frontend │ │
│  │   (Host)    │  │   (Host)    │  │  (Host)   │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
│         │                │                │       │
└─────────┼────────────────┼────────────────┼───────┘
          │                │                │
          │ localhost:9092 │ localhost:5432 │
          │                │                │
┌─────────▼────────────────▼────────────────▼───────┐
│            DOCKER BRIDGE NETWORK                   │
│            (kafka_default)                         │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │Zookeeper │  │  Kafka   │  │ TimescaleDB  │    │
│  │  :2181   │  │ :9092    │  │   :5432      │    │
│  └─────┬────┘  │ :29092   │  └──────┬───────┘    │
│        │       └────┬─────┘         │            │
│        │            │               │            │
│  ┌─────▼────┐  ┌───▼──────┐  ┌─────▼──────┐     │
│  │  Kafka   │  │ Kafdrop  │  │  Adminer   │     │
│  │  (dep)   │  │  :9000   │  │   :8080    │     │
│  └──────────┘  └──────────┘  └────────────┘     │
└────────────────────────────────────────────────────┘
```

### DNS Resolution

Docker Compose automatically creates DNS entries:
- Service name = hostname
- Example: `kafka` resolves to Kafka container's IP
- Containers can ping each other by name

**Test DNS:**
```bash
docker exec kafdrop ping -c 1 kafka
docker exec adminer ping -c 1 timescaledb
```

### Custom Network (Optional)

To create a custom network:

```yaml
networks:
  kafka-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16

services:
  kafka:
    networks:
      - kafka-network
```

---

## Volume Management

### Named Volumes

Docker Compose creates 4 named volumes for data persistence:

```yaml
volumes:
  zookeeper-data:
  zookeeper-log:
  kafka-data:
  timescaledb-data:
```

### Volume Details

| Volume Name | Used By | Mount Point | Purpose | Typical Size |
|-------------|---------|-------------|---------|--------------|
| **zookeeper-data** | Zookeeper | `/var/lib/zookeeper/data` | Zookeeper state | ~100 MB |
| **zookeeper-log** | Zookeeper | `/var/lib/zookeeper/log` | Transaction logs | ~50 MB |
| **kafka-data** | Kafka | `/var/lib/kafka/data` | Message logs | 1 GB - 100 GB |
| **timescaledb-data** | TimescaleDB | `/var/lib/postgresql/data` | Database files | 100 MB - 50 GB |

### Volume Locations

**Windows (WSL2):**
```
\\wsl$\docker-desktop-data\data\docker\volumes\kafka_zookeeper-data
\\wsl$\docker-desktop-data\data\docker\volumes\kafka_zookeeper-log
\\wsl$\docker-desktop-data\data\docker\volumes\kafka_kafka-data
\\wsl$\docker-desktop-data\data\docker\volumes\kafka_timescaledb-data
```

**Linux:**
```
/var/lib/docker/volumes/kafka_zookeeper-data/_data
/var/lib/docker/volumes/kafka_zookeeper-log/_data
/var/lib/docker/volumes/kafka_kafka-data/_data
/var/lib/docker/volumes/kafka_timescaledb-data/_data
```

**macOS:**
```
~/Library/Containers/com.docker.docker/Data/vms/0/data/docker/volumes/
```

### Volume Commands

**List volumes:**
```bash
docker volume ls
```

**Inspect volume:**
```bash
docker volume inspect kafka_timescaledb-data
```

**View volume usage:**
```bash
docker system df -v
```

**Remove unused volumes:**
```bash
docker volume prune
```

**Backup volume:**
```bash
# Backup TimescaleDB data
docker run --rm -v kafka_timescaledb-data:/data -v $(pwd):/backup alpine tar czf /backup/timescaledb-backup.tar.gz -C /data .
```

**Restore volume:**
```bash
# Restore TimescaleDB data
docker run --rm -v kafka_timescaledb-data:/data -v $(pwd):/backup alpine tar xzf /backup/timescaledb-backup.tar.gz -C /data
```

---

## Environment Variables

### Complete Environment Variable Reference

#### Zookeeper Environment Variables

```yaml
ZOOKEEPER_CLIENT_PORT: 2181
ZOOKEEPER_TICK_TIME: 2000
```

| Variable | Value | Default | Description |
|----------|-------|---------|-------------|
| ZOOKEEPER_CLIENT_PORT | 2181 | 2181 | Port for client connections |
| ZOOKEEPER_TICK_TIME | 2000 | 3000 | Basic time unit in milliseconds |

**Additional Variables (Not Used):**
- `ZOOKEEPER_SERVER_ID` - Server ID in cluster (for multi-node)
- `ZOOKEEPER_SERVERS` - List of servers (for cluster)
- `ZOOKEEPER_INIT_LIMIT` - Initial sync time limit
- `ZOOKEEPER_SYNC_LIMIT` - Sync time limit

#### Kafka Environment Variables

```yaml
KAFKA_BROKER_ID: 1
KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,DOCKER://0.0.0.0:29092
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,DOCKER://kafka:29092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,DOCKER:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
```

| Variable | Value | Description |
|----------|-------|-------------|
| KAFKA_BROKER_ID | 1 | Unique broker identifier |
| KAFKA_ZOOKEEPER_CONNECT | zookeeper:2181 | Zookeeper connection string |
| KAFKA_LISTENERS | PLAINTEXT://0.0.0.0:9092,<br>DOCKER://0.0.0.0:29092 | Listener addresses to bind |
| KAFKA_ADVERTISED_LISTENERS | PLAINTEXT://localhost:9092,<br>DOCKER://kafka:29092 | Addresses advertised to clients |
| KAFKA_LISTENER_SECURITY_PROTOCOL_MAP | PLAINTEXT:PLAINTEXT,<br>DOCKER:PLAINTEXT | Protocol for each listener |
| KAFKA_INTER_BROKER_LISTENER_NAME | PLAINTEXT | Listener for broker communication |
| KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR | 1 | Replication for __consumer_offsets |
| KAFKA_TRANSACTION_STATE_LOG_MIN_ISR | 1 | Min in-sync replicas for transactions |
| KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR | 1 | Transaction log replication |
| KAFKA_AUTO_CREATE_TOPICS_ENABLE | "true" | Auto-create topics on first message |

**Production Recommendations:**
- `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3`
- `KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3`
- `KAFKA_MIN_INSYNC_REPLICAS: 2`

#### TimescaleDB Environment Variables

```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
POSTGRES_DB: todo_history
```

| Variable | Value | Description |
|----------|-------|-------------|
| POSTGRES_USER | postgres | Superuser username |
| POSTGRES_PASSWORD | postgres | Superuser password (CHANGE IN PRODUCTION!) |
| POSTGRES_DB | todo_history | Default database to create |

**Additional Variables (Supported):**
- `POSTGRES_INITDB_ARGS` - Additional initdb arguments
- `PGDATA` - Database storage location
- `POSTGRES_HOST_AUTH_METHOD` - Authentication method

**Security Warning:**
⚠️ Change `POSTGRES_PASSWORD` in production! Never use default passwords.

#### Kafdrop Environment Variables

```yaml
KAFKA_BROKERCONNECT: "kafka:29092"
JVM_OPTS: "-Xms32M -Xmx64M"
SERVER_PORT: 9000
```

| Variable | Value | Description |
|----------|-------|-------------|
| KAFKA_BROKERCONNECT | kafka:29092 | Kafka broker connection string |
| JVM_OPTS | -Xms32M -Xmx64M | Java heap size (min/max) |
| SERVER_PORT | 9000 | Web server port |

**Additional Variables (Supported):**
- `KAFKA_PROPERTIES` - Additional Kafka properties
- `JMX_PORT` - JMX monitoring port
- `HOST` - Bind address

---

## Port Mappings

### Complete Port Reference

| Host Port | Container Port | Service | Protocol | Purpose | Access |
|-----------|----------------|---------|----------|---------|--------|
| 2181 | 2181 | Zookeeper | TCP | Client connections | Local |
| 9092 | 9092 | Kafka | TCP | External broker access | Local |
| 29092 | 29092 | Kafka | TCP | Internal broker access | Docker |
| 5432 | 5432 | TimescaleDB | TCP | PostgreSQL connections | Local |
| 8080 | 8080 | Adminer | HTTP | Database UI | Browser |
| 9000 | 9000 | Kafdrop | HTTP | Kafka UI | Browser |

### Port Access Matrix

| Client | Zookeeper | Kafka | TimescaleDB | Adminer | Kafdrop |
|--------|-----------|-------|-------------|---------|---------|
| **Host Apps** | :2181 | :9092 | :5432 | :8080 | :9000 |
| **Docker Apps** | zookeeper:2181 | kafka:29092 | timescaledb:5432 | adminer:8080 | kafdrop:9000 |
| **Browser** | ❌ | ❌ | ❌ | ✅ :8080 | ✅ :9000 |

### Firewall Rules (If Needed)

**Windows Firewall:**
```bash
# Allow inbound on ports
netsh advfirewall firewall add rule name="Kafka" dir=in action=allow protocol=TCP localport=9092
netsh advfirewall firewall add rule name="TimescaleDB" dir=in action=allow protocol=TCP localport=5432
```

**Linux (UFW):**
```bash
sudo ufw allow 9092/tcp
sudo ufw allow 5432/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9000/tcp
```

---

## Getting Started

### Prerequisites

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Version: 20.10+
   - Download: https://www.docker.com/products/docker-desktop

2. **Docker Compose**
   - Version: 2.0+
   - Included with Docker Desktop
   - Linux: Install separately

3. **System Requirements**
   - RAM: 4 GB minimum, 8 GB recommended
   - Disk: 10 GB free space
   - CPU: 2 cores minimum

### Installation Steps

#### Step 1: Verify Docker Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 24.0.0 or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.0.0 or higher
```

#### Step 2: Navigate to Project Directory

```bash
cd C:\Users\bdhayalesh\Desktop\KTern\kafka
```

#### Step 3: Start All Services

```bash
# Start all containers in detached mode
docker compose up -d

# Or start with build (if Dockerfiles exist)
docker compose up -d --build

# View startup logs
docker compose logs -f
```

**Expected Output:**
```
[+] Running 6/6
 ✔ Network kafka_default          Created
 ✔ Volume "kafka_zookeeper-data"  Created
 ✔ Volume "kafka_zookeeper-log"   Created
 ✔ Volume "kafka_kafka-data"      Created
 ✔ Volume "kafka_timescaledb-data" Created
 ✔ Container zookeeper            Started
 ✔ Container kafka                Started
 ✔ Container timescaledb          Started
 ✔ Container adminer              Started
 ✔ Container kafdrop              Started
```

#### Step 4: Verify Services Are Running

```bash
# Check container status
docker compose ps

# Expected output:
NAME          IMAGE                                  STATUS
zookeeper     confluentinc/cp-zookeeper:7.6.1       Up
kafka         confluentinc/cp-kafka:7.6.1           Up
timescaledb   timescale/timescaledb:latest-pg16     Up
adminer       adminer:latest                         Up
kafdrop       obsidiandynamics/kafdrop              Up
```

#### Step 5: Verify Service Health

**Check Zookeeper:**
```bash
docker exec zookeeper bash -c "echo stat | nc localhost 2181"
# Should show Zookeeper statistics
```

**Check Kafka:**
```bash
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
# Should list topics (may be empty initially)
```

**Check TimescaleDB:**
```bash
docker exec timescaledb pg_isready -U postgres
# Expected: /var/run/postgresql:5432 - accepting connections
```

**Check Web UIs:**
- Adminer: http://localhost:8080
- Kafdrop: http://localhost:9000

#### Step 6: Create Kafka Topic

```bash
# Create todo-history-events topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --create \
  --topic todo-history-events \
  --partitions 1 \
  --replication-factor 1

# Verify topic created
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

#### Step 7: Initialize TimescaleDB

```bash
# Connect to database
docker exec -it timescaledb psql -U postgres -d todo_history

# Create TimescaleDB extension (if not auto-created)
CREATE EXTENSION IF NOT EXISTS timescaledb;

# Verify extension
\dx

# Exit
\q
```

**Note:** The Go consumer will auto-create the `todo_event_logs` table on first run.

---

## Container Management

### Starting Services

**Start all services:**
```bash
docker compose up -d
```

**Start specific service:**
```bash
docker compose up -d kafka
docker compose up -d timescaledb
```

**Start with logs visible:**
```bash
docker compose up
```

### Stopping Services

**Stop all services:**
```bash
docker compose stop
```

**Stop specific service:**
```bash
docker compose stop kafka
```

**Stop and remove containers:**
```bash
docker compose down
```

**Stop and remove containers + volumes (⚠️ DELETES DATA):**
```bash
docker compose down -v
```

### Restarting Services

**Restart all services:**
```bash
docker compose restart
```

**Restart specific service:**
```bash
docker compose restart kafka
```

### Viewing Logs

**View all logs:**
```bash
docker compose logs
```

**Follow logs (live tail):**
```bash
docker compose logs -f
```

**View specific service logs:**
```bash
docker compose logs kafka
docker compose logs timescaledb
```

**View last N lines:**
```bash
docker compose logs --tail=100 kafka
```

**View logs with timestamps:**
```bash
docker compose logs -t kafka
```

### Executing Commands in Containers

**Interactive shell:**
```bash
# Zookeeper
docker exec -it zookeeper bash

# Kafka
docker exec -it kafka bash

# TimescaleDB
docker exec -it timescaledb bash
```

**Single command:**
```bash
# Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# PostgreSQL query
docker exec timescaledb psql -U postgres -d todo_history -c "SELECT COUNT(*) FROM todo_event_logs;"
```

### Inspecting Containers

**View container details:**
```bash
docker inspect kafka
docker inspect timescaledb
```

**View resource usage:**
```bash
docker stats
```

**View processes:**
```bash
docker top kafka
```

### Updating Services

**Pull latest images:**
```bash
docker compose pull
```

**Rebuild and restart:**
```bash
docker compose up -d --build --force-recreate
```

**Update single service:**
```bash
docker compose up -d --force-recreate kafka
```

---

## Monitoring & Management UIs

### Adminer (Database Management)

**Access:** http://localhost:8080

**Login:**
```
System: PostgreSQL
Server: timescaledb
Username: postgres
Password: postgres
Database: todo_history
```

**Features:**
- Browse tables and data
- Execute SQL queries
- Export/import data
- Manage database structure
- View indexes and constraints

**Common Tasks:**

**View event logs:**
```sql
SELECT * FROM todo_event_logs
ORDER BY timestamp DESC
LIMIT 100;
```

**Count events by type:**
```sql
SELECT event_type, COUNT(*)
FROM todo_event_logs
GROUP BY event_type;
```

**Export data:**
1. Click on table name
2. Click "Export" button
3. Select format (CSV, SQL, etc.)
4. Download file

---

### Kafdrop (Kafka Monitoring)

**Access:** http://localhost:9000

**No Authentication Required**

**Features:**
- View all topics
- Browse messages
- Inspect message content
- View consumer groups
- Monitor partitions
- Search messages

**Common Tasks:**

**View Topics:**
1. Open http://localhost:9000
2. See list of all topics
3. Click topic name for details

**Browse Messages:**
1. Click topic name
2. Select partition
3. View messages in order
4. Inspect JSON content

**Monitor Consumer Groups:**
1. Click "Consumer Groups" tab
2. Find `todo-consumer-group-go`
3. View consumer lag
4. Check partition assignment

**Search Messages:**
1. Navigate to topic
2. Use search box
3. Enter search criteria
4. View matching messages

---

## Data Persistence

### What Data is Persisted?

| Service | Volume | Data Type | Importance |
|---------|--------|-----------|------------|
| Zookeeper | zookeeper-data | Cluster state | Critical |
| Zookeeper | zookeeper-log | Transaction logs | Critical |
| Kafka | kafka-data | Message logs | Critical |
| TimescaleDB | timescaledb-data | Database files | Critical |

### Data Lifecycle

**When containers are stopped:**
```bash
docker compose stop
```
- ✅ Data is preserved
- ✅ Volumes remain intact
- ✅ Next start resumes with same data

**When containers are removed:**
```bash
docker compose down
```
- ✅ Data is still preserved
- ✅ Volumes remain intact
- ⚠️ Containers are deleted
- ✅ Next `up` creates new containers with same data

**When volumes are removed:**
```bash
docker compose down -v
```
- ❌ All data is deleted
- ❌ Kafka messages lost
- ❌ Database wiped
- ⚠️ This is destructive and irreversible

### Backup Strategies

#### 1. Volume Backup (All Services)

**Backup all volumes:**
```bash
mkdir backups
docker run --rm \
  -v kafka_zookeeper-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/zookeeper-data.tar.gz -C /data .

docker run --rm \
  -v kafka_kafka-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/kafka-data.tar.gz -C /data .

docker run --rm \
  -v kafka_timescaledb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/timescaledb-data.tar.gz -C /data .
```

#### 2. TimescaleDB Backup (Recommended)

**Using pg_dump:**
```bash
# Backup database to file
docker exec timescaledb pg_dump -U postgres todo_history > backup.sql

# Restore from file
cat backup.sql | docker exec -i timescaledb psql -U postgres todo_history
```

**Using pg_dumpall (all databases):**
```bash
docker exec timescaledb pg_dumpall -U postgres > all-databases.sql
```

#### 3. Kafka Backup (Advanced)

Kafka messages are typically transient. For long-term storage:
- Use TimescaleDB (already implemented)
- Enable Kafka log retention
- Use Kafka Connect for S3 backup

### Restore Procedures

**Restore volume:**
```bash
docker run --rm \
  -v kafka_timescaledb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/timescaledb-data.tar.gz -C /data
```

**Restore database:**
```bash
cat backup.sql | docker exec -i timescaledb psql -U postgres todo_history
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Containers Won't Start

**Symptoms:**
```bash
docker compose ps
# Shows containers as "Exited" or "Restarting"
```

**Solutions:**

**Check logs:**
```bash
docker compose logs kafka
docker compose logs zookeeper
```

**Check port conflicts:**
```bash
# Windows
netstat -ano | findstr "9092"
netstat -ano | findstr "5432"

# Linux/Mac
lsof -i :9092
lsof -i :5432
```

**Solution:** Stop conflicting services or change ports in docker-compose.yml

---

#### Issue 2: Kafka Can't Connect to Zookeeper

**Symptoms:**
```
WARN [Controller id=1] Connection to node -1 (zookeeper/172.x.x.x:2181) could not be established
```

**Solutions:**

**Check Zookeeper is running:**
```bash
docker compose ps zookeeper
```

**Check Zookeeper health:**
```bash
docker exec zookeeper bash -c "echo stat | nc localhost 2181"
```

**Restart services in order:**
```bash
docker compose restart zookeeper
docker compose restart kafka
```

---

#### Issue 3: TimescaleDB Connection Refused

**Symptoms:**
```
psql: error: connection to server at "localhost", port 5432 failed
```

**Solutions:**

**Check TimescaleDB is running:**
```bash
docker compose ps timescaledb
```

**Check if accepting connections:**
```bash
docker exec timescaledb pg_isready -U postgres
```

**Check logs:**
```bash
docker compose logs timescaledb
```

**Restart TimescaleDB:**
```bash
docker compose restart timescaledb
```

---

#### Issue 4: Adminer Can't Connect to Database

**Symptoms:**
Adminer shows "Unable to connect" error

**Solutions:**

**Verify TimescaleDB is running:**
```bash
docker compose ps timescaledb
```

**Use correct connection details:**
- System: PostgreSQL
- Server: **timescaledb** (not localhost!)
- Username: postgres
- Password: postgres

**Check Docker network:**
```bash
docker network inspect kafka_default
```

---

#### Issue 5: Kafdrop Shows No Brokers

**Symptoms:**
Kafdrop UI shows "No brokers available"

**Solutions:**

**Check Kafka is running:**
```bash
docker compose ps kafka
```

**Verify Kafdrop uses correct broker:**
```bash
docker compose logs kafdrop
# Should show: KAFKA_BROKERCONNECT=kafka:29092
```

**Test Kafka from Kafdrop container:**
```bash
docker exec kafdrop nc -zv kafka 29092
```

---

#### Issue 6: Out of Disk Space

**Symptoms:**
```
Error response from daemon: no space left on device
```

**Solutions:**

**Check disk usage:**
```bash
docker system df
```

**Clean up unused resources:**
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ careful!)
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

**Increase Docker disk allocation:**
- Docker Desktop → Settings → Resources → Disk image size

---

#### Issue 7: Slow Performance

**Symptoms:**
- Slow container startup
- High CPU/memory usage
- Lag in message processing

**Solutions:**

**Check resource usage:**
```bash
docker stats
```

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPUs: 4+
- Increase Memory: 8 GB+

**Optimize JVM settings (Kafka/Kafdrop):**
```yaml
# In docker-compose.yml
environment:
  KAFKA_HEAP_OPTS: "-Xms1G -Xmx2G"
```

---

### Diagnostic Commands

**System-wide diagnostics:**
```bash
# Check Docker status
docker info

# Check disk usage
docker system df

# Check running containers
docker ps -a

# Check networks
docker network ls

# Check volumes
docker volume ls
```

**Service-specific diagnostics:**
```bash
# Kafka broker info
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Kafka consumer groups
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# PostgreSQL connection
docker exec timescaledb psql -U postgres -c "SELECT version();"

# Zookeeper status
docker exec zookeeper bash -c "echo stat | nc localhost 2181"
```

---

## Performance Tuning

### Kafka Performance

**Increase retention period:**
```yaml
environment:
  KAFKA_LOG_RETENTION_HOURS: 168  # 7 days (default: 168)
  KAFKA_LOG_RETENTION_BYTES: 10737418240  # 10 GB
```

**Increase heap size:**
```yaml
environment:
  KAFKA_HEAP_OPTS: "-Xms2G -Xmx4G"
```

**Enable compression:**
```yaml
environment:
  KAFKA_COMPRESSION_TYPE: "snappy"
```

### TimescaleDB Performance

**Increase shared buffers:**
```yaml
command:
  - "postgres"
  - "-c"
  - "shared_buffers=256MB"
  - "-c"
  - "max_connections=200"
```

**Tune work memory:**
```bash
docker exec timescaledb psql -U postgres -c "ALTER SYSTEM SET work_mem = '16MB';"
docker compose restart timescaledb
```

**Enable autovacuum:**
```sql
ALTER TABLE todo_event_logs SET (autovacuum_enabled = true);
```

### Docker Performance

**Use volumes instead of bind mounts** (already using volumes ✅)

**Limit logs:**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

**Optimize network:**
```yaml
networks:
  default:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1450
```

---

## Security Considerations

### Current Security Issues

❌ **Default passwords in use**
- TimescaleDB: postgres/postgres
- Adminer: No authentication

❌ **No TLS/SSL encryption**
- Kafka: Plaintext communication
- PostgreSQL: Unencrypted connections

❌ **No network restrictions**
- All ports exposed to host
- No firewall rules

❌ **No access control**
- Kafdrop: Public access
- Adminer: Public access

### Recommended Security Improvements

#### 1. Change Default Passwords

**TimescaleDB:**
```yaml
environment:
  POSTGRES_PASSWORD: "STRONG_RANDOM_PASSWORD_HERE"
```

**Use Docker secrets:**
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  timescaledb:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
```

#### 2. Enable TLS/SSL

**Kafka with SSL:**
```yaml
environment:
  KAFKA_LISTENERS: SSL://0.0.0.0:9093
  KAFKA_SSL_KEYSTORE_FILENAME: kafka.keystore.jks
  KAFKA_SSL_KEYSTORE_CREDENTIALS: keystore_creds
  KAFKA_SSL_KEY_CREDENTIALS: key_creds
```

**PostgreSQL with SSL:**
```yaml
command:
  - "postgres"
  - "-c"
  - "ssl=on"
  - "-c"
  - "ssl_cert_file=/etc/ssl/certs/server.crt"
  - "-c"
  - "ssl_key_file=/etc/ssl/private/server.key"
```

#### 3. Restrict Network Access

**Internal network only:**
```yaml
services:
  kafka:
    ports:
      - "127.0.0.1:9092:9092"  # Localhost only
```

**Remove public UIs in production:**
```yaml
# Comment out or remove
# adminer:
# kafdrop:
```

#### 4. Add Authentication

**Kafka SASL authentication:**
```yaml
environment:
  KAFKA_SASL_ENABLED_MECHANISMS: PLAIN
  KAFKA_SASL_MECHANISM_INTER_BROKER_PROTOCOL: PLAIN
```

**Adminer with custom credentials:**
Use environment variables or custom image

#### 5. Use Non-Root Users

**Run as specific user:**
```yaml
services:
  kafka:
    user: "1000:1000"
```

#### 6. Limit Container Capabilities

```yaml
services:
  kafka:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

#### 7. Enable Read-Only Root Filesystem

```yaml
services:
  kafka:
    read_only: true
    tmpfs:
      - /tmp
```

---

## Backup & Recovery

### Automated Backup Script

**backup.sh:**
```bash
#!/bin/bash

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup TimescaleDB
docker exec timescaledb pg_dump -U postgres todo_history > $BACKUP_DIR/database.sql

# Backup Kafka topics
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic todo-history-events \
  --from-beginning \
  --timeout-ms 10000 > $BACKUP_DIR/kafka-messages.json

# Backup volumes
docker run --rm \
  -v kafka_timescaledb-data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/timescaledb-volume.tar.gz -C /data .

echo "Backup completed: $BACKUP_DIR"
```

**Make executable:**
```bash
chmod +x backup.sh
```

**Run backup:**
```bash
./backup.sh
```

### Automated Backup with Cron

**Linux crontab:**
```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/docker-backup.log 2>&1
```

**Windows Task Scheduler:**
Create scheduled task to run backup.sh via WSL or Git Bash

### Disaster Recovery Plan

**Full system recovery:**

1. **Restore volumes:**
```bash
docker compose down
docker volume rm kafka_timescaledb-data
docker volume create kafka_timescaledb-data

docker run --rm \
  -v kafka_timescaledb-data:/data \
  -v $(pwd)/backups/latest:/backup \
  alpine tar xzf /backup/timescaledb-volume.tar.gz -C /data
```

2. **Start services:**
```bash
docker compose up -d
```

3. **Verify restoration:**
```bash
docker exec timescaledb psql -U postgres -d todo_history -c "SELECT COUNT(*) FROM todo_event_logs;"
```

---

## Appendix

### Quick Reference Commands

**Start services:**
```bash
docker compose up -d
```

**Stop services:**
```bash
docker compose stop
```

**View logs:**
```bash
docker compose logs -f
```

**Restart service:**
```bash
docker compose restart kafka
```

**Remove everything:**
```bash
docker compose down -v
```

**Backup database:**
```bash
docker exec timescaledb pg_dump -U postgres todo_history > backup.sql
```

### Access URLs

- **Adminer:** http://localhost:8080
- **Kafdrop:** http://localhost:9000

### Connection Strings

**Kafka:**
```
localhost:9092
```

**TimescaleDB:**
```
postgres://postgres:postgres@localhost:5432/todo_history
```

**Zookeeper:**
```
localhost:2181
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Docker Compose Version:** 3.x
**Maintained By:** Development Team

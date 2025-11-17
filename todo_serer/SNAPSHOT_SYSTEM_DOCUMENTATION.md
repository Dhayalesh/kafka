# MongoDB Snapshot & Restore System

## Overview
Complete time machine system for MongoDB data with automatic snapshots triggered via Kafka events and processed by Go consumer.

## Architecture
1. **Node.js API** → Database operations → Kafka `SNAPSHOT_TRIGGER` events
2. **Go Consumer** → Processes triggers → Creates MongoDB snapshots → Kafka `todo-snapshots` topic
3. **Snapshot Processor** → Consumes snapshot JSON → Uploads to S3
4. **TimescaleDB** → Logs snapshot references (not S3 paths)

## Single Service Command

```bash
cd go-consumer
go run unified-main.go
```

This single command runs:
- **Main Consumer**: Processes events and snapshot triggers
- **Snapshot Processor**: Uploads snapshot JSON to S3
- **Both services** run concurrently in the same process

## Kafka Topics
- `todo-history-events` - Regular events and snapshot triggers
- `todo-snapshots` - Complete snapshot JSON data

## Automatic Triggers
Snapshots are automatically created on every database operation:
- Group: CREATE, UPDATE, DELETE
- Task: CREATE, UPDATE, DELETE, STATUS_CHANGE
- Comment: CREATE

## Snapshot Structure

Each snapshot is a single JSON file containing:
```json
{
  "snapshotId": "snapshot_2025_02_25_17_40_10",
  "createdAt": "2025-02-25T17:40:10Z",
  "createdBy": "Admin",
  "data": {
    "groups": [...],
    "tasks": [...],
    "comments": [...],
    "users": [...]
  },
  "metadata": {
    "counts": {
      "groups": 5,
      "tasks": 23,
      "comments": 47,
      "users": 3
    }
  }
}
```

## Storage Location
- S3 Bucket: `s3://your-bucket/snapshots/`
- Files: `snapshot_YYYY_MM_DD_HH_MM_SS.json`

## Environment Variables
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-snapshots-bucket
```

## TimescaleDB Logging
All snapshot operations are logged with events:
- `SNAPSHOT_CREATED`
- `SNAPSHOT_RESTORED` 
- `SNAPSHOT_DELETED`

## Usage Examples

### Create Snapshot
```javascript
const result = await snapshotService.createSnapshot('Admin');
console.log(result.snapshotId); // snapshot_2025_02_25_17_40_10
```

### Restore Snapshot
```javascript
const result = await snapshotService.restoreSnapshot('snapshot_2025_02_25_17_40_10', 'Admin');
console.log(result.restoredCounts); // { groups: 5, tasks: 23, ... }
```

### List Snapshots
```javascript
const snapshots = await snapshotService.listSnapshots();
snapshots.forEach(s => console.log(s.snapshotId, s.createdAt));
```

## System Behavior

1. **Snapshot Creation**: Reads all MongoDB collections → Creates single JSON file → Logs to TimescaleDB
2. **Snapshot Restoration**: Clears MongoDB → Inserts data from JSON → Logs to TimescaleDB  
3. **No Maintenance Mode**: System remains operational during snapshots
4. **Complete State**: Every snapshot contains 100% of MongoDB data
5. **Audit Trail**: All operations logged in TimescaleDB with metadata
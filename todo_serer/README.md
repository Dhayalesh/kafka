# Todo Manager Backend API

A REST API for managing todo groups, tasks, and comments built with Express.js and MongoDB.

## Setup

1. **Install MongoDB** (if not already installed)
   - Download from https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

   Server accepts requests from any origin/port.

4. **Test the API**
   ```bash
   npm test              # Basic API test
   npm run test-events   # Enhanced change tracking test
   ```

## API Endpoints

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group with tasks
- `DELETE /api/groups/:id` - Delete group

### Tasks
- `POST /api/groups/:groupId/tasks` - Create task
- `GET /api/tasks/:id` - Get task with comments
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `POST /api/tasks/:taskId/comments` - Add comment
- `GET /api/tasks/:taskId/comments` - Get task comments

## Status Values
- 'New'
- 'Backlog' 
- 'In Progress'
- 'Completed'
- 'Approved'

## Enhanced Change Tracking

All operations now generate detailed Kafka events with "changed from X to Y" format:

- **Status Changes**: "Task status changed from 'New' to 'In Progress'"
- **Task Updates**: "Task name changed from 'Old Name' to 'New Name', Start date changed from 'empty' to '2024-01-15'"
- **Group Updates**: "Group name changed from 'Old Group' to 'New Group'"
- **Comments**: "Comment added to task 'Task Name': 'Comment text'"
- **Deletions**: "Task 'Task Name' with status 'Completed' was deleted"

## Environment Variables
- `PORT=3001`
- `MONGODB_URI=mongodb://localhost:27017/todo_manager`
- `KAFKA_BROKER=localhost:9092`
- `KAFKA_TOPIC=todo-history-events`
- `KAFKA_ENABLED=true`
- `NODE_ENV=development`
# Todo Manager - Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack & Versions](#technical-stack--versions)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Environment Variables](#environment-variables)
6. [Backend Connection & API Integration](#backend-connection--api-integration)
7. [Authentication Flow](#authentication-flow)
8. [State Management Architecture](#state-management-architecture)
9. [Routing Structure](#routing-structure)
10. [Component Architecture](#component-architecture)
11. [API Service Layer](#api-service-layer)
12. [Application Flow Diagrams](#application-flow-diagrams)
13. [Data Flow](#data-flow)
14. [Build & Deployment](#build--deployment)
15. [Development Guidelines](#development-guidelines)

---

## Project Overview

A modern, real-time task management application built with React 19 and Vite. The application allows users to organize tasks into groups, collaborate with team members, track task status, and maintain activity logs.

**Key Features:**
- User authentication with session persistence
- Task organization with groups
- Real-time task status updates
- Activity logging and auditing
- Task comments and collaboration
- User and workspace context tracking

---

## Technical Stack & Versions

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.1.1 | Core UI library |
| React DOM | ^19.1.1 | React rendering |
| React Router DOM | ^7.9.5 | Client-side routing |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Vite | ^7.1.7 | Build tool & dev server |
| @vitejs/plugin-react | ^5.0.4 | React support for Vite |
| ESLint | ^9.36.0 | Code linting |
| eslint-plugin-react-hooks | ^5.2.0 | React hooks linting |
| eslint-plugin-react-refresh | ^0.4.22 | Fast refresh support |
| @types/react | ^19.1.16 | TypeScript definitions |
| @types/react-dom | ^19.1.9 | TypeScript definitions |
| globals | ^16.4.0 | Global variables |

### Build Tools & Configuration
- **Build Tool:** Vite 7.1.7
- **Language:** JavaScript (ES6+) with JSX
- **Module System:** ES Modules
- **Linting:** ESLint with React-specific rules
- **Package Manager:** npm (any version)

---

## Project Structure

```
todo/
├── public/
│   └── vite.svg                    # Vite logo asset
│
├── src/
│   ├── api/
│   │   └── todoService.js          # Centralized API service layer
│   │
│   ├── assets/
│   │   └── react.svg               # React logo asset
│   │
│   ├── components/
│   │   ├── EditGroupModal.jsx      # Modal for editing group details
│   │   ├── EditTaskModal.jsx       # Modal for editing task details
│   │   ├── Header.jsx              # Application header with user info
│   │   └── Login.jsx               # Login page component
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication context provider
│   │
│   ├── App.css                     # Application-specific styles
│   ├── App.jsx                     # Root application component
│   ├── GroupDetails.jsx            # Individual group view page
│   ├── GroupsList.jsx              # Groups list page (home)
│   ├── index.css                   # Global styles
│   ├── main.jsx                    # Application entry point
│   └── TodoContext.jsx             # Todo state management context
│
├── .env                            # Environment configuration
├── .gitignore                      # Git ignore rules
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── README.md                       # Project readme
└── vite.config.js                  # Vite configuration
```

### Directory Breakdown

#### `/src/api/`
Centralized API service layer that handles all backend communication.

#### `/src/components/`
Reusable UI components used across the application.

#### `/src/contexts/`
React Context providers for global state management.

#### `/src/` (root)
Page-level components and application configuration files.

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- Backend server running on `http://localhost:3001`

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd C:\Users\bdhayalesh\Desktop\KTern\kafka\todo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create or verify the `.env` file exists with the correct backend URL:
   ```bash
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   (The port may vary; check the terminal output)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## Environment Variables

### Configuration File: `.env`

The application uses Vite's environment variable system. All environment variables must be prefixed with `VITE_` to be exposed to the client.

### Available Variables

```bash
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:3001/api
```

### Accessing Environment Variables in Code

```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

### Important Notes
- Environment variables are embedded at build time
- Changes to `.env` require restarting the dev server
- Never commit sensitive data to `.env` files
- Use `.env.local` for local overrides (add to `.gitignore`)

### Environment File Hierarchy

Vite supports multiple environment files:

```
.env                # Loaded in all cases
.env.local          # Loaded in all cases, ignored by git
.env.development    # Loaded in development mode
.env.production     # Loaded in production mode
```

---

## Backend Connection & API Integration

### Backend URL Configuration

The frontend connects to the backend using the base URL configured in the `.env` file:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

### API Communication Layer

**Location:** [src/api/todoService.js](src/api/todoService.js)

**Architecture:** Singleton service class pattern

**Key Features:**
- Centralized API endpoint management
- Automatic user context injection
- localStorage integration
- Standard JSON communication

### User Context Injection

All mutating requests (POST, PUT, DELETE) automatically include:
```javascript
{
  user: "username",      // From localStorage
  workspace: "default"   // Configurable workspace
}
```

---

## API Service Layer

### Complete API Endpoints Reference

#### Authentication Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/auth/login` | User login | `{username, password}` | `{success, data: {username, ...}}` |
| GET | `/auth/users` | Get all users | None | `{success, data: [users]}` |

#### Groups Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/groups` | Get all groups | None | `{success, data: [groups]}` |
| GET | `/groups/:id` | Get single group | None | `{success, data: group}` |
| POST | `/groups` | Create new group | `{name, discussion, user, workspace}` | `{success, data: group}` |
| PUT | `/groups/:id` | Update group | `{name, discussion, user, workspace}` | `{success, data: group}` |
| DELETE | `/groups/:id` | Delete group | `{user, workspace}` | `{success}` |

#### Tasks Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/groups/:id/tasks` | Create task | `{title, description, user, workspace}` | `{success, data: task}` |
| PUT | `/tasks/:id` | Update task | `{title, description, user, workspace}` | `{success, data: task}` |
| PUT | `/tasks/:id/status` | Update status | `{status, user, workspace}` | `{success, data: task}` |
| DELETE | `/tasks/:id` | Delete task | `{user, workspace}` | `{success}` |

#### Comments Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/tasks/:id/comments` | Add comment | `{text, user, workspace}` | `{success, data: comment}` |

#### Logs Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/logs/group/:id` | Get group logs | None | `{success, data: [logs]}` |
| GET | `/logs/groups` | Get all groups logs | None | `{success, data: [logs]}` |

### API Service Methods

**File:** [src/api/todoService.js](src/api/todoService.js)

```javascript
// Authentication
todoService.login(username, password)
todoService.getUsers()

// Groups
todoService.getGroups()
todoService.getGroup(id)
todoService.createGroup({name, discussion})
todoService.updateGroup(id, {name, discussion})
todoService.deleteGroup(id)

// Tasks
todoService.createTask(groupId, {title, description})
todoService.updateTask(id, {title, description})
todoService.updateTaskStatus(taskId, status)
todoService.deleteTask(id)

// Comments
todoService.addComment(taskId, text)

// Logs
todoService.getGroupLogs(groupId)
todoService.getAllGroupsLogs()

// Utility
todoService.getCurrentUser()  // Gets user from localStorage
```

### Example API Usage

```javascript
import todoService from './api/todoService'

// Login
const result = await todoService.login('username', 'password')
if (result.success) {
  localStorage.setItem('todoUser', JSON.stringify(result.data))
}

// Create a group
const groupResult = await todoService.createGroup({
  name: 'Project Alpha',
  discussion: 'Main project tasks'
})

// Create a task
const taskResult = await todoService.createTask(groupId, {
  title: 'Implement login',
  description: 'Add user authentication'
})

// Update task status
await todoService.updateTaskStatus(taskId, 'completed')
```

---

## Authentication Flow

### Authentication Architecture

**File:** [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)

### Auth Context Provider

The application uses React Context API for authentication state management.

```javascript
<AuthProvider>
  <App />
</AuthProvider>
```

### Authentication State

```javascript
{
  user: {username, ...},      // Current user object
  loading: boolean,            // Initial auth check loading
  isAuthenticated: boolean,    // Computed from user existence
  login: (userData) => void,   // Login function
  logout: () => void          // Logout function
}
```

### Authentication Flow Diagram

```
┌─────────────────┐
│  App Loads      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Check localStorage      │
│ for 'todoUser'          │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Found    Not Found
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Parse  │ │ Show   │
│ User   │ │ Login  │
│ Data   │ │ Page   │
└────┬───┘ └────┬───┘
     │          │
     │     User enters
     │     credentials
     │          │
     │          ▼
     │   ┌──────────────┐
     │   │ Call API     │
     │   │ /auth/login  │
     │   └──────┬───────┘
     │          │
     │     ┌────┴────┐
     │     │         │
     │   Success  Failure
     │     │         │
     │     ▼         ▼
     │   Save    Show Error
     │   to LS       │
     │     │         │
     └─────┴─────────┘
           │
           ▼
    ┌─────────────┐
    │ Show Main   │
    │ Application │
    └─────────────┘
```

### Login Component

**File:** [src/components/Login.jsx](src/components/Login.jsx)

**Default Demo Users:**
```javascript
[
  { username: 'Avinash', password: 'Avinash123' },
  { username: 'Dhaya', password: 'Dhaya123' },
  { username: 'Ashok', password: 'Ashok123' },
  { username: 'Arun', password: 'Arun123' },
  { username: 'Cathrine', password: 'Cathrine123' }
]
```

### Using Authentication in Components

```javascript
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div>
      {isAuthenticated && (
        <p>Welcome, {user.username}</p>
      )}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Session Persistence

- User data stored in `localStorage` with key `'todoUser'`
- Persists across browser sessions
- Automatically loaded on application startup
- Cleared on logout

---

## State Management Architecture

### Overview

The application uses **React Context API** for global state management (no Redux or external libraries).

### Context Providers

#### 1. AuthContext

**File:** [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)

**Purpose:** Manages user authentication state

**State:**
```javascript
{
  user: Object | null,
  loading: boolean,
  isAuthenticated: boolean
}
```

**Methods:**
- `login(userData)` - Set user and update localStorage
- `logout()` - Clear user and remove from localStorage

**Custom Hook:** `useAuth()`

#### 2. TodoContext

**File:** [src/TodoContext.jsx](src/TodoContext.jsx)

**Purpose:** Manages application data (groups, tasks)

**State:**
```javascript
{
  groups: Array,
  loading: boolean
}
```

**Methods:**
- `loadGroups()` - Fetch all groups from API
- `addGroup(name, discussion)` - Create new group
- `updateGroup(id, data)` - Update group details
- `deleteGroup(id)` - Remove group
- `addTask(groupId, taskData)` - Create new task
- `updateTask(id, data)` - Update task details
- `deleteTask(id)` - Remove task
- `updateTaskStatus(taskId, status)` - Change task status
- `addComment(taskId, comment)` - Add task comment
- `getGroupLogs(groupId)` - Fetch group activity logs
- `getAllGroupsLogs()` - Fetch all logs

**Custom Hook:** `useTodo()`

### Context Architecture Diagram

```
┌──────────────────────────────────────┐
│          App Component               │
│                                      │
│  ┌────────────────────────────────┐ │
│  │      AuthProvider              │ │
│  │  (User Authentication)         │ │
│  │                                │ │
│  │  ┌──────────────────────────┐ │ │
│  │  │    TodoProvider          │ │ │
│  │  │  (Application Data)      │ │ │
│  │  │                          │ │ │
│  │  │  ┌────────────────────┐ │ │ │
│  │  │  │   Router           │ │ │ │
│  │  │  │                    │ │ │ │
│  │  │  │  ┌──────────────┐ │ │ │ │
│  │  │  │  │   Routes     │ │ │ │ │
│  │  │  │  │              │ │ │ │ │
│  │  │  │  │ - GroupsList │ │ │ │ │
│  │  │  │  │ - GroupDetail│ │ │ │ │
│  │  │  │  └──────────────┘ │ │ │ │
│  │  │  └────────────────────┘ │ │ │
│  │  └──────────────────────────┘ │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Using Context in Components

```javascript
import { useTodo } from '../TodoContext'
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { groups, addGroup, loading } = useTodo()
  const { user, logout } = useAuth()

  const handleCreateGroup = async () => {
    const result = await addGroup('New Group', 'Discussion')
    if (result.success) {
      console.log('Group created!')
    }
  }

  return (
    <div>
      {loading ? 'Loading...' : `${groups.length} groups`}
    </div>
  )
}
```

---

## Routing Structure

### Router Configuration

**File:** [src/App.jsx](src/App.jsx)

**Router Library:** React Router DOM v7.9.5

### Route Definitions

| Path | Component | Description |
|------|-----------|-------------|
| `/` | GroupsList | Home page - displays all groups |
| `/group/:groupId` | GroupDetails | Individual group view with tasks |

### Route Protection

All routes are protected by authentication:

```javascript
function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <TodoProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GroupsList />} />
          <Route path="/group/:groupId" element={<GroupDetails />} />
        </Routes>
      </Router>
    </TodoProvider>
  )
}
```

### Navigation Examples

```javascript
import { useNavigate, useParams } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  const { groupId } = useParams()

  // Navigate to a group
  const goToGroup = (id) => {
    navigate(`/group/${id}`)
  }

  // Go back to home
  const goHome = () => {
    navigate('/')
  }
}
```

### Routing Flow Diagram

```
┌────────────────┐
│  User Access   │
│  Application   │
└───────┬────────┘
        │
        ▼
┌───────────────────┐
│  Check Auth       │
│  isAuthenticated? │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    │         ▼
    │   ┌──────────┐
    │   │  Login   │
    │   │  Page    │
    │   └──────────┘
    │
    ▼
┌─────────────┐
│  BrowserRouter │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Routes │
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌─────────────┐
│  /   │  │ /group/:id  │
└──┬───┘  └──────┬──────┘
   │             │
   ▼             ▼
┌───────────┐ ┌─────────────┐
│GroupsList │ │GroupDetails │
└───────────┘ └─────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── AppContent
│       ├── Login (if not authenticated)
│       └── TodoProvider
│           ├── Header
│           └── Router
│               ├── GroupsList
│               │   ├── EditGroupModal
│               │   └── Group Items
│               └── GroupDetails
│                   ├── EditGroupModal
│                   ├── EditTaskModal
│                   └── Task Items
```

### Core Components

#### App Component
**File:** [src/App.jsx](src/App.jsx)

Root component that sets up providers and routing.

```javascript
<AuthProvider>
  <AppContent />
</AuthProvider>
```

#### Header Component
**File:** [src/components/Header.jsx](src/components/Header.jsx)

Application header displaying user info and logout option.

**Props:**
- `user` - Current user object
- `onLogout` - Logout callback function

#### Login Component
**File:** [src/components/Login.jsx](src/components/Login.jsx)

Authentication page with login form.

**Props:**
- `onLogin` - Login callback function

**Features:**
- Username/password form
- Quick access to demo users
- Error handling
- Loading state

#### GroupsList Component
**File:** [src/GroupsList.jsx](src/GroupsList.jsx)

Home page displaying all task groups.

**Features:**
- List of all groups
- Create new group
- Edit/delete groups
- View group logs
- Navigate to group details

#### GroupDetails Component
**File:** [src/GroupDetails.jsx](src/GroupDetails.jsx)

Individual group view with tasks.

**Features:**
- Group information
- Task list with status
- Add new tasks
- Edit/delete tasks
- Task status updates
- Task comments
- Activity logs

#### EditGroupModal Component
**File:** [src/components/EditGroupModal.jsx](src/components/EditGroupModal.jsx)

Modal for editing group details.

**Props:**
- `isOpen` - Modal visibility
- `onClose` - Close callback
- `onSave` - Save callback
- `group` - Group data to edit

#### EditTaskModal Component
**File:** [src/components/EditTaskModal.jsx](src/components/EditTaskModal.jsx)

Modal for editing task details.

**Props:**
- `isOpen` - Modal visibility
- `onClose` - Close callback
- `onSave` - Save callback
- `task` - Task data to edit

### Component Communication

```
┌────────────────────────────────────┐
│         Context Providers          │
│  (AuthContext, TodoContext)        │
└──────────────┬─────────────────────┘
               │
               │ Provides state & methods
               │
┌──────────────▼─────────────────────┐
│         Components                 │
│  (Header, GroupsList, etc.)        │
└──────────────┬─────────────────────┘
               │
               │ Calls methods
               │
┌──────────────▼─────────────────────┐
│         TodoService                │
│  (API communication)               │
└──────────────┬─────────────────────┘
               │
               │ HTTP requests
               │
┌──────────────▼─────────────────────┐
│         Backend API                │
└────────────────────────────────────┘
```

---

## Application Flow Diagrams

### Complete Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION START                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  main.jsx: Render App in StrictMode                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  App.jsx: Wrap with AuthProvider                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthContext: Check localStorage for 'todoUser'             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  User Found      │      │  No User Found   │
    │  (Authenticated) │      │  (Not Auth)      │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             │                         ▼
             │               ┌──────────────────────┐
             │               │  Show Login Page     │
             │               └────────┬─────────────┘
             │                        │
             │                        │ User logs in
             │                        │
             │                        ▼
             │               ┌──────────────────────┐
             │               │ API: POST /auth/login│
             │               └────────┬─────────────┘
             │                        │
             │                   ┌────┴────┐
             │                   │         │
             │                Success   Failure
             │                   │         │
             │                   │         ▼
             │                   │    Show Error
             │                   │         │
             │                   ▼         │
             │         Save to localStorage
             │                   │
             └───────────────────┴─────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Wrap with TodoProvider                                      │
│  - Load groups on mount                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Show Header + Router                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Default Route: GroupsList (/)                              │
│  - Display all groups                                        │
│  - Create, edit, delete groups                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ User clicks group
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Navigate to: GroupDetails (/group/:id)                     │
│  - Display group info                                        │
│  - List all tasks                                            │
│  - Create, edit, delete tasks                               │
│  - Update task status                                        │
│  - Add comments                                              │
│  - View activity logs                                        │
└─────────────────────────────────────────────────────────────┘
```

### Group Management Flow

```
┌─────────────────┐
│  GroupsList     │
│  Page           │
└────────┬────────┘
         │
         │ Click "Create Group"
         │
         ▼
┌─────────────────────┐
│  Show Create Form   │
│  (Name, Discussion) │
└────────┬────────────┘
         │
         │ Submit
         │
         ▼
┌────────────────────────┐
│ useTodo().addGroup()   │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────────────┐
│ todoService.createGroup()    │
│ POST /groups                 │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend creates group        │
│ Logs activity                │
│ Publishes Kafka event        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update local state           │
│ Refresh groups list          │
└──────────────────────────────┘
```

### Task Management Flow

```
┌─────────────────┐
│  GroupDetails   │
│  Page           │
└────────┬────────┘
         │
         │ Click "Add Task"
         │
         ▼
┌─────────────────────────┐
│  Show Task Form         │
│  (Title, Description)   │
└────────┬────────────────┘
         │
         │ Submit
         │
         ▼
┌────────────────────────┐
│ useTodo().addTask()    │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────────────┐
│ todoService.createTask()     │
│ POST /groups/:id/tasks       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend creates task         │
│ Logs activity                │
│ Publishes Kafka event        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Reload all groups            │
│ (includes new task)          │
└──────────────────────────────┘
```

### Task Status Update Flow

```
┌─────────────────┐
│  Task Card      │
└────────┬────────┘
         │
         │ Change status
         │ (pending → in-progress → completed)
         │
         ▼
┌───────────────────────────────┐
│ useTodo().updateTaskStatus()  │
└────────┬──────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ todoService.updateTaskStatus()   │
│ PUT /tasks/:id/status            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend updates status       │
│ Logs activity                │
│ Publishes Kafka event        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Reload all groups            │
│ UI reflects new status       │
└──────────────────────────────┘
```

---

## Data Flow

### Complete Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          USER ACTION                          │
│  (Click button, submit form, change status, etc.)            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   REACT COMPONENT                             │
│  (GroupsList, GroupDetails, etc.)                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ Call context method
                         │ (e.g., addGroup, updateTask)
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    TODO CONTEXT                               │
│  (TodoContext.jsx)                                            │
│  - Manages application state                                  │
│  - Coordinates API calls                                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ Delegate to service
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   TODO SERVICE                                │
│  (todoService.js)                                             │
│  - Builds API request                                         │
│  - Adds user context                                          │
│  - Manages endpoint URLs                                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTP Request
                         │ (GET, POST, PUT, DELETE)
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND API                                 │
│  (http://localhost:3001/api)                                  │
│  - Process request                                            │
│  - Database operations                                        │
│  - Kafka event publishing                                     │
│  - Activity logging                                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTP Response
                         │ {success: true/false, data/error}
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   TODO SERVICE                                │
│  - Receives response                                          │
│  - Returns data to context                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   TODO CONTEXT                                │
│  - Updates local state                                        │
│  - Triggers re-render                                         │
│  - May reload data (loadGroups)                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ State change propagated
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   REACT COMPONENT                             │
│  - Re-renders with new data                                   │
│  - UI reflects updated state                                  │
└──────────────────────────────────────────────────────────────┘
```

### State Update Patterns

#### Optimistic Update (not used)
The app does NOT use optimistic updates. All state changes wait for server confirmation.

#### Server-Confirmed Updates (current pattern)
```javascript
const addTask = async (groupId, taskData) => {
  try {
    const result = await todoService.createTask(groupId, taskData)
    if (result.success) {
      await loadGroups()  // Reload all data from server
    }
    return result
  } catch (error) {
    return { success: false, error }
  }
}
```

### Data Refresh Strategy

Most mutations trigger a full data reload:
- Creating a task → `loadGroups()`
- Updating a task → `loadGroups()`
- Deleting a task → `loadGroups()`
- Changing task status → `loadGroups()`
- Adding a comment → `loadGroups()`

This ensures data consistency with the backend.

---

## Build & Deployment

### Development Build

```bash
# Start development server
npm run dev

# Features:
# - Hot Module Replacement (HMR)
# - Fast refresh
# - Source maps
# - Dev server on http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Output:
# - Creates 'dist' folder
# - Minified JavaScript
# - Optimized assets
# - Tree-shaking applied
# - Code splitting
```

### Preview Production Build

```bash
# Preview production build locally
npm run preview

# Serves the 'dist' folder
# Useful for testing before deployment
```

### Build Output Structure

```
dist/
├── assets/
│   ├── index-[hash].js       # Main JavaScript bundle
│   ├── index-[hash].css      # Compiled CSS
│   └── [other-assets]        # Images, fonts, etc.
├── index.html                # Entry HTML file
└── vite.svg                  # Static assets
```

### Environment-Specific Builds

```bash
# Development
npm run dev                # Uses .env and .env.development

# Production
npm run build              # Uses .env and .env.production
```

### Deployment Checklist

- [ ] Update `VITE_API_BASE_URL` in `.env.production` to production API URL
- [ ] Run `npm run build` to create production bundle
- [ ] Test the build using `npm run preview`
- [ ] Upload `dist` folder to hosting service
- [ ] Configure hosting service to serve `index.html` for all routes (SPA routing)
- [ ] Ensure backend API is accessible from the frontend URL
- [ ] Configure CORS on backend to allow frontend domain

### Hosting Options

**Static Hosting Services:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Firebase Hosting

**Server-Based Hosting:**
- Traditional web servers (Nginx, Apache)
- Node.js servers (Express serving static files)
- Docker containers

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Development Guidelines

### Code Style

#### JavaScript/JSX Conventions
- Use functional components with hooks
- Use arrow functions for component definitions
- Use destructuring for props and context values
- Use async/await for asynchronous operations
- Keep components small and focused

#### Example Component Structure
```javascript
import { useState, useEffect } from 'react'
import { useTodo } from '../TodoContext'

function MyComponent({ prop1, prop2 }) {
  const [localState, setLocalState] = useState(null)
  const { groups, addGroup } = useTodo()

  useEffect(() => {
    // Side effects
  }, [])

  const handleAction = async () => {
    // Event handlers
  }

  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default MyComponent
```

### State Management Best Practices

1. **Use Context for Global State**
   - Authentication state → AuthContext
   - Application data → TodoContext

2. **Use Local State for UI State**
   - Form inputs
   - Modal visibility
   - Loading states

3. **Don't Store Derived Data**
   - Compute values from state instead

### API Integration Guidelines

1. **Always use todoService**
   - Never call fetch directly in components

2. **Handle Errors Gracefully**
   ```javascript
   try {
     const result = await todoService.createGroup(data)
     if (result.success) {
       // Success handling
     } else {
       // Error handling
     }
   } catch (error) {
     // Network error handling
   }
   ```

3. **Show Loading States**
   ```javascript
   {loading ? <div>Loading...</div> : <Content />}
   ```

### Component Organization

```
Component Structure:
1. Imports
2. Component definition
3. State declarations
4. Effects
5. Event handlers
6. Helper functions
7. Return JSX
8. Export
```

### Testing Recommendations

While no tests are currently implemented, consider:

1. **Unit Tests**
   - Individual components
   - Utility functions
   - Context providers

2. **Integration Tests**
   - Component interactions
   - API service layer

3. **E2E Tests**
   - User flows
   - Authentication
   - CRUD operations

**Recommended Tools:**
- Vitest (unit tests)
- React Testing Library
- Playwright or Cypress (E2E)

### Performance Optimization

1. **Lazy Loading Routes**
   ```javascript
   const GroupDetails = lazy(() => import('./GroupDetails'))
   ```

2. **Memoization**
   ```javascript
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
   ```

3. **Callback Optimization**
   ```javascript
   const memoizedCallback = useCallback(() => {
     doSomething(a, b)
   }, [a, b])
   ```

4. **Avoid Unnecessary Re-renders**
   - Use React DevTools Profiler
   - Optimize context value objects

### Security Best Practices

1. **Never Store Sensitive Data in localStorage**
   - Current implementation stores user data (consider using secure cookies)

2. **Validate User Input**
   - Sanitize before sending to API

3. **Use HTTPS in Production**
   - Update `VITE_API_BASE_URL` to use `https://`

4. **Implement CSRF Protection**
   - Coordinate with backend team

5. **Set Proper CORS Policies**
   - Configure backend to accept only trusted origins

### Debugging Tips

1. **React DevTools**
   - Install browser extension
   - Inspect component props and state
   - Profile performance

2. **Vite Dev Server Logging**
   ```bash
   npm run dev -- --debug
   ```

3. **Console Logging**
   ```javascript
   console.log('Debug:', { groups, user })
   ```

4. **Network Tab**
   - Monitor API calls
   - Check request/response payloads

### Git Workflow

1. **Branch Naming**
   - `feature/feature-name`
   - `bugfix/bug-description`
   - `hotfix/critical-fix`

2. **Commit Messages**
   - Use clear, descriptive messages
   - Format: `type: description`
   - Examples:
     - `feat: add task editing modal`
     - `fix: resolve login error handling`
     - `refactor: improve API service structure`

3. **Pull Request Process**
   - Create PR with description
   - Request code review
   - Run linting: `npm run lint`
   - Test locally before merging

---

## Appendix

### Common Issues & Solutions

#### Issue: API calls failing
**Solution:** Check that backend is running on `http://localhost:3001` and `.env` is configured correctly.

#### Issue: HMR not working
**Solution:** Restart dev server: `npm run dev`

#### Issue: Build failing
**Solution:** Delete `node_modules` and run `npm install` again.

#### Issue: Routing not working in production
**Solution:** Configure hosting service to serve `index.html` for all routes.

### Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Response Format

All API responses follow this structure:

```javascript
// Success
{
  success: true,
  data: { /* response data */ }
}

// Error
{
  success: false,
  error: {
    message: "Error message",
    code: "ERROR_CODE"
  }
}
```

### Task Status Values

Valid task status values:
- `"pending"` - Task not started
- `"in-progress"` - Task being worked on
- `"completed"` - Task finished

### Browser Support

The application uses modern JavaScript features and supports:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Current | Initial frontend documentation |

---

**Document maintained by:** Development Team
**Last updated:** 2025-11-10
**Frontend Version:** 0.0.0

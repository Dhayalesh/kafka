import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TodoProvider } from './TodoContext'
import Login from './components/Login'
import Header from './components/Header'
import TasksList from './TasksList'

function AppContent() {
  const { user, login, logout, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="container">
        <div className="max-width">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return (
    <TodoProvider>
      <Header user={user} onLogout={logout} />
      <Router>
        <Routes>
          <Route path="/" element={<TasksList />} />
        </Routes>
      </Router>
    </TodoProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
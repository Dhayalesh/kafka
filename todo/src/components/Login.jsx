import { useState } from 'react'
import todoService from '../api/todoService'

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const defaultUsers = [
    { username: 'Avinash', password: 'Avinash123' },
    { username: 'Dhaya', password: 'Dhaya123' },
    { username: 'Ashok', password: 'Ashok123' },
    { username: 'Arun', password: 'Arun123' },
    { username: 'Cathrine', password: 'Cathrine123' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await todoService.login(credentials.username, credentials.password)
      if (result.success) {
        localStorage.setItem('todoUser', JSON.stringify(result.data))
        onLogin(result.data)
      } else {
        setError(result.error.message)
      }
    } catch (error) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="max-width">
        <div className="login-container">
          <div className="login-card">
            <h1 className="title">Todo Manager</h1>
            <p className="login-subtitle">Sign in to manage your tasks</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  placeholder="Username"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Password"
                  className="input"
                  required
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="login-demo">
              <p>Default Users:</p>
              <div className="default-users">
                {defaultUsers.map(user => (
                  <button 
                    key={user.username}
                    type="button"
                    onClick={() => setCredentials(user)}
                    className="user-button"
                  >
                    {user.username}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
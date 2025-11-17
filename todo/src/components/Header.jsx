function Header({ user, onLogout }) {
  return (
    <div className="header">
      <div className="header-content">
        <h1 className="header-title">Todo Manager</h1>
        <div className="user-info">
          <span className="welcome-text">Welcome, {user.username}</span>
          <button onClick={onLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
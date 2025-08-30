import React, { useState } from 'react';
import './adminLogin.css';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
     
if (response.ok) {
  navigate('/admin/menu');  
} else {
  setError('Invalid username or password');
}

    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <>
      <header className="header">
        <div className="nav-container">
          <div className="logo">FeedUp</div>
          <nav>
            <ul className="nav-links">
              <li><a href="/">Home</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        
        <section className="info-section">
          <h1 className="page-title">Admin Access</h1>
          <p className="page-subtitle">
            Secure login for administrators to access feedback dashboard, analytics, and management tools.
          </p>
          
          <div className="security-info">
            <h3>Security Notice</h3>
            <p>
              This area is restricted to authorized personnel only. All login attempts are monitored and logged
              for security purposes. Please ensure you have proper authorization before proceeding.
            </p>
          </div>
        </section>

     
        <section className="login-section">
          <div className="login-header">
            <h2 className="login-title">Admin Login</h2>
            <p className="login-subtitle">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button">Sign In</button>

            <div className="form-links">
              <a href="#">Forgot Password?</a>
              <a href="#">Need Help?</a>
            </div>

            {error && <div className="error-message">{error}</div>}
          </form>
        </section>
      </main>
    </>
  );
}

export default AdminLogin;
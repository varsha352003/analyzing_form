import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminMenu.css';
import { BarChart2, MessageCircle } from 'lucide-react';

function AdminMenu() {
  const navigate = useNavigate();

  return (
    <div className="admin-menu-container">
      <header className="admin-header">
        <div className="nav-container">
          <div className="logo">FeedUp</div>
          <button 
            className="logout-button"
            onClick={() => {
              fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                credentials: 'include'
              }).then(() => navigate('/'));
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="menu-content">
        <h1 className="welcome-title">Welcome, Admin</h1>
        <p className="menu-subtitle">Choose where you'd like to go</p>

        <div className="menu-options">
          <div 
            className="menu-card"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart2 size={48} />
            <h2>Dashboard</h2>
            <p>View analytics, ratings, and sentiment analysis of all feedback</p>
          </div>

          <div 
            className="menu-card"
            onClick={() => navigate('/topic-modeling')}
          >
            <MessageCircle size={48} />
            <h2>Topic Modeling</h2>
            <p>Analyze feedback patterns and discover common themes</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminMenu;
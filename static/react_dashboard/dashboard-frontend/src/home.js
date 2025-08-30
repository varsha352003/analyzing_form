import React from 'react';
import './home.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToAdmin = () => {
    navigate('/admin/login');
  };

  const goToFeedback = () => {
    navigate('/feedback');
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">FeedUp</h1>
        <p className="subtitle">Feedback and Analysis Portal</p>
        <p className="description">
          Welcome to our comprehensive educational platform. Choose your role below to access the appropriate section of our system.
        </p>
      </div>

      <div className="options-container">
        <div className="option-card" onClick={goToAdmin}>
          <span className="option-icon" role="img" aria-label="admin"></span>
          <h2 className="option-title">Administrator</h2>
          <p className="option-description">
            Access the administrative dashboard to manage courses, users, and system settings. Administrative privileges required.
          </p>
          <button className="option-button">Login as Admin</button>
        </div>

        <div className="option-card" onClick={goToFeedback}>
          <span className="option-icon" role="img" aria-label="student"></span>
          <h2 className="option-title">Student Portal</h2>
          <p className="option-description">
            Share your valuable feedback about courses and help us improve the learning experience for everyone.
          </p>
          <button className="option-button">Give Feedback</button>
        </div>
      </div>

      <div className="footer">
        <p>&copy; 2025 FeedUp. Empowering education through technology.</p>
      </div>
    </div>
  );
};

export default HomePage;

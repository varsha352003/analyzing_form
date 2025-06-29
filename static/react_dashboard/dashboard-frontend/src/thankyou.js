import React, { useEffect, useState } from 'react';
import './thankyou.css';
import { useNavigate } from 'react-router-dom';

const ThankYouPage = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const ref = Math.floor(Math.random() * 900000) + 100000;
    setReferenceNumber(ref);
  }, []);

  const submitAnotherFeedback = () => {
    alert('Redirecting to feedback form...');
    navigate('/feedback');
  };

  const goToHomepage = () => {
    alert('Redirecting to homepage...');
    navigate('/');
  };

  const viewCourses = () => {
    alert('Redirecting to courses page...');
    navigate('/courses');
  };

  return (
    <div className="thank-you-container">
      <div className="success-icon">✓</div>
      <h1 className="thank-you-title">Thank You!</h1>
      <p className="thank-you-subtitle">Your feedback has been successfully submitted</p>
      <p className="thank-you-message">
        We appreciate you taking the time to share your thoughts. Your feedback helps us improve our courses and provide better learning experiences for all students.
      </p>

      <div className="reference-number">
        Reference #: FB-2025-{referenceNumber}
      </div>

      <div className="feedback-summary">
        <h3>Submission Summary</h3>
        <div className="summary-item">
          <span className="summary-label">Course:</span>
          <span className="summary-value">Web Development Fundamentals</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Rating:</span>
          <span className="summary-value">
            <span className="summary-stars">★★★★★</span>
            <span>(Excellent)</span>
          </span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={submitAnotherFeedback}>Submit Another Feedback</button>
        <button className="btn btn-primary" onClick={goToHomepage}>Return to Homepage</button>
        <button className="btn btn-tertiary" onClick={viewCourses}>View My Courses</button>
      </div>
    </div>
  );
};

export default ThankYouPage;

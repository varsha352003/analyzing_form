import React, { useState } from 'react';
import './feedbackForm.css';
import { useNavigate } from 'react-router-dom';

function FeedbackForm() {
  const [course, setCourse] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const ratingTexts = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = {
    course,
    rating,
    feedback_text: feedback,
  };

  try {
    const response = await fetch('/api/submit_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      navigate('/thankyou');
    } else {
      alert('Failed to submit feedback. Please try again.');
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
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
          <h1 className="page-title">Share Your Course Experience</h1>
          <p className="page-subtitle">
            Your feedback helps us create better learning experiences for everyone. Take a moment to share your thoughts about your recent course.
          </p>

          

          <div className="data-info">
            <h3>How We Use Your Feedback</h3>
            <p>
              Your responses help us with course-wise comparison, rating aggregation, sentiment analysis, keyword extraction, time-based trends, and optional personalization for record keeping. All data is handled securely and used solely for educational improvement purposes.
            </p>
          </div>
        </section>

        <section className="form-section">
          <div className="form-header">
            <h2>Course Feedback Form</h2>
            <p>Help us improve your learning experience</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <select id="course" name="course" value={course} onChange={(e) => setCourse(e.target.value)} required>
                <option value="">Select a course</option>
                <option value="web-development">Web Development Fundamentals</option>
                <option value="data-science">Data Science & Analytics</option>
                <option value="mobile-development">Mobile App Development</option>
                <option value="ui-ux-design">UI/UX Design</option>
                <option value="digital-marketing">Digital Marketing</option>
                <option value="cybersecurity">Cybersecurity Basics</option>
                <option value="machine-learning">Machine Learning</option>
                <option value="cloud-computing">Cloud Computing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="rating-container">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${rating > i ? 'active' : ''}`}
                      onClick={() => handleStarClick(i)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">{rating > 0 ? ratingTexts[rating - 1] : 'Click to rate'}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Feedback</label>
              <textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about the course..."
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Submit Feedback</button>
          </form>
        </section>
      </main>
    </>
  );
}

export default FeedbackForm;



import React, { useState, useEffect } from 'react';
import './topicmodeling.css';


const TopicModelingDashboard = () => {

  const [feedbackData, setFeedbackData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [alert, setAlert] = useState(null);
  const [minFeedbackCount, setMinFeedbackCount] = useState(5); 
  const [stats, setStats] = useState({ totalFeedback: 0, activeCourses: 0 });


  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    try {
      const response = await fetch('/api/analysis', { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      setFeedbackData(data.feedback_data || []);
      const uniqueCourses = [...new Set((data.feedback_data || []).map(item => item.course))];
      setCourses(uniqueCourses);
      setStats({
        totalFeedback: data.total_feedback || 0,
        activeCourses: data.active_courses || 0,
      });

    } catch (error) {
      showAlert('error', 'Data Loading Failed', error.message);
    }
  };


  const handleRunAnalysis = async () => {
    if (isLoading) return;

    let dataToAnalyze = feedbackData;
    if (selectedCourse !== 'all') {
      dataToAnalyze = feedbackData.filter(item => item.course === selectedCourse);
    }

    if (dataToAnalyze.length < minFeedbackCount) {
      showAlert('warning', 'Insufficient Data', `At least ${minFeedbackCount} feedback items are required for analysis. Found ${dataToAnalyze.length}.`);
      return;
    }

    setIsLoading(true);
    setResults(null);
    setAlert(null);

    try {
      const response = await fetch('/api/analyze_topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          feedback: dataToAnalyze,
          min_feedback_count: minFeedbackCount 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status: ${response.status}`);
      }

      const analysisResults = await response.json();
      setResults(analysisResults);
      showAlert('success', 'Analysis Complete', `Successfully processed ${dataToAnalyze.length} feedback items.`);

    } catch (error) {
      showAlert('error', 'Analysis Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
  };

  
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="results-dashboard">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Analysis Results</h2>
            <p className="analysis-timestamp">Analysis completed on {new Date().toLocaleString()}</p>
          </div>
        </div>

        {Object.entries(results).map(([courseId, courseData]) => (
          <div key={courseId} className="course-section">
            <h3 className="course-title">{courseId}</h3>
            {courseData.status === 'Success' && Array.isArray(courseData.topics) ? (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Topic Name</th>
                    <th>Feedback Count</th>
                    <th>Top Keywords</th>
                    <th>Example Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {courseData.topics.map((topic, index) => (
                    <tr key={index}>
                      <td>{topic.topic_name || `Topic ${index + 1}`}</td>
                      <td>{topic.count}</td>
                      <td>{topic.keywords.slice(0, 5).join(', ')}</td>
                      <td>{topic.examples.length > 0 ? `"${topic.examples[0].substring(0, 100)}..."` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="status-message error">
                <p><strong>{courseData.status}:</strong> {courseData.reason || 'Unable to process this course.'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="topic-modeling-app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">Feedback Analysis Dashboard</div>
          <div className="nav-menu">
            <a href="#" className="nav-link active">Topic Modeling</a>
            
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Analysis Tools</h3>
          </div>
          <div className="sidebar-menu">
            <div className="menu-item active">Topic Modeling</div>
          
          </div>
          <div className="sidebar-footer">
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Total Feedback</span>
                <span className="stat-value">{stats.totalFeedback.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Courses</span>
                <span className="stat-value">{stats.activeCourses}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-header">
            <div>
              <h1 className="page-title">Advanced Topic Modeling</h1>
              <p className="page-subtitle">Discover hidden themes in course feedback using AI-powered analysis.</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </div>

          <div className="control-panel">
            <div className="panel-header">
              <h3>Analysis Configuration</h3>
            </div>
            <div className="panel-content">
              <div className="control-grid">
                <div className="control-group">
                  <label className="control-label">Course Selection</label>
                  <select 
                    className="form-select" 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course} value={course}>
                        {course} ({feedbackData.filter(f => f.course === course).length} items)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="control-group">
                  <label className="control-label">Minimum Feedback Items</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={minFeedbackCount}
                    onChange={(e) => setMinFeedbackCount(parseInt(e.target.value, 10))}
                    min="5" 
                    max="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {alert && (
            <div className={`alert ${alert.type}`}>
              <div className="alert-content">
                <strong>{alert.title}:</strong> {alert.message}
              </div>
              <button className="alert-close" onClick={() => setAlert(null)}>&times;</button>
            </div>
          )}

          {isLoading && (
            <div className="loading-container">
              <p>Processing feedback data... This may take a moment.</p>
            </div>
          )}

          {renderResults()}

        </main>
      </div>
    </div>
  );
};

export default TopicModelingDashboard;
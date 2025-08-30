import React, { useEffect, useState } from 'react'; 
import './dashboard.css';
import {
  Star,
  MessageCircle,
  BarChart3,
  Home,
  BookOpen,
  Users,
  Settings,
  Bell,
  Search,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/analysis', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        console.log('Received data:', data); 
        
        
        const processedData = {
          summary: data.summary || {},
          average_rating: data.average_rating || {},
          sentiment_distribution: data.sentiment_distribution || {},
          sentiment_monthly: data.sentiment_monthly || [],
          rating_monthly: data.rating_monthly || [],
          views: data.views || {}
        };
        
        const courses = Object.keys(processedData.summary);
        if (courses.length > 0) {
          setSelectedCourse(courses[0]);
        }
        setDashboardData(processedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('API error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);


  const getSentimentData = (course) => {
    const distribution = dashboardData?.sentiment_distribution?.[course];
    if (!distribution) return [];
    
    return ["Negative", "Neutral", "Positive"].map(label => ({
      name: label,
      value: distribution[label] || 0,
      color:
        label === "Negative" ? "#EF4444" :
        label === "Neutral" ? "#F59E0B" :
        "#14532d"
    }));
  };


  const getTotalReviews = (course) => {
    const distribution = dashboardData?.sentiment_distribution?.[course];
    if (!distribution) return 0;
    return Object.values(distribution).reduce((a, b) => a + b, 0);
  };

 
  const getMonthlyRating = (course) => {
    if (!dashboardData?.rating_monthly) return [];
    return dashboardData.rating_monthly
      .filter(item => item.course === course)
      .map(item => ({
        month: item.month,
        rating: item.average_rating || 0,
      }));
  };


  const getMonthlySentiment = (course) => {
    if (!dashboardData?.sentiment_monthly) return [];
    return dashboardData.sentiment_monthly
      .filter(item => item.course === course)
      .map(item => ({
        month: item.month,
        positive: item.Positive || 0,
        neutral: item.Neutral || 0,
        negative: item.Negative || 0,
      }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!dashboardData || !selectedCourse) {
    return <div className="error">No data available</div>;
  }

  const currentData = {
    avgRating: dashboardData.average_rating[selectedCourse] || 0,
    totalReviews: getTotalReviews(selectedCourse),
    sentiment: getSentimentData(selectedCourse),
    monthlyRating: getMonthlyRating(selectedCourse),
    monthlySentiment: getMonthlySentiment(selectedCourse),
    summary: dashboardData.summary[selectedCourse] || "No summary available.",
    views: dashboardData.views[selectedCourse] || 0
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">FeedAnalytics</div>
        <ul className="sidebar-menu">
      
          
        </ul>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="controls">
            
            <label className="dropdown-label">
              Select Course:
              <select 
                className="course-dropdown styled-dropdown"
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}>
                {Object.keys(dashboardData.summary).map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section className="cards-container">
          <div className="card">
            <Star />
            <div>
              <h2>{currentData.avgRating.toFixed(1)}</h2>
              <p>Average Rating</p>
            </div>
          </div>
          <div className="card">
            <MessageCircle />
            <div>
              <h2>{currentData.totalReviews}</h2>
              <p>Total Reviews</p>
            </div>
          </div>
          
          <div className="card">
            <BarChart3 />
            <div>
              <h2>Summary</h2>
              <p>{currentData.summary}</p>
            </div>
          </div>
        </section>

        <section className="charts-grid-horizontal">
          <div className="chart-card">
            <h3>Monthly Average Rating</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={currentData.monthlyRating}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#14532d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Monthly Sentiment Changes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentData.monthlySentiment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill="#14532d" />
                <Bar dataKey="neutral" stackId="a" fill="#F59E0B" />
                <Bar dataKey="negative" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="charts-grid-full">
          <div className="chart-card">
            <h3>Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={currentData.sentiment} 
                  dataKey="value" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100}>
                  {currentData.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />

                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
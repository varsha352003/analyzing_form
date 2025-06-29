import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  Star,
  MessageCircle,
  BookOpen,
  Calendar,
  Filter,
  BarChart as BarChartIcon
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

 useEffect(() => {
  fetch('http://localhost:5000//api/analysis', {
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
      const courses = Object.keys(data.summary || {});
      setSelectedCourse(courses[0] || '');
      setDashboardData(data);
    })
    .catch(err => console.error('API error:', err));
}, []);

  const currentData = dashboardData && selectedCourse
    ? {
        summary: {
          avgRating: dashboardData.average_rating[selectedCourse],
          totalReviews: Object.values(dashboardData.sentiment_distribution[selectedCourse] || {}).reduce((a, b) => a + b, 0),
          totalStudents: 100,
          completion: 85,
        },
        sentiment: ["Negative", "Neutral", "Positive"].map(label => ({
          name: label,
          value: dashboardData.sentiment_distribution[selectedCourse]?.[label] || 0,
          color:
            label === "Negative" ? "#EF4444" :
            label === "Neutral" ? "#F59E0B" :
            "#10B981"
        })),
        monthlyRating: dashboardData.rating_monthly
          .filter(item => item.course === selectedCourse)
          .map(item => ({
            month: item.month,
            rating: item.average_rating,
          })),
        monthlySentiment: dashboardData.sentiment_monthly
          .filter(item => item.course === selectedCourse)
          .map(item => ({
            month: item.month,
            positive: item.Positive || 0,
            neutral: item.Neutral || 0,
            negative: item.Negative || 0,
          })),
        courses: Object.keys(dashboardData.summary).map(course => ({
          course,
          avgRating: dashboardData.average_rating[course],
          totalReviews: Object.values(dashboardData.sentiment_distribution[course] || {}).reduce((a, b) => a + b, 0),
          students: 100,
          completion: 85,
          trend: "↑ better",
        }))
      }
    : null;

  const topMetrics = currentData ? [
    { title: 'Total Students', value: currentData.summary.totalStudents, icon: Users, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Average Rating', value: currentData.summary.avgRating.toFixed(1), icon: Star, color: 'from-yellow-500 to-yellow-600', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { title: 'Total Reviews', value: currentData.summary.totalReviews, icon: MessageCircle, color: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { title: 'Completion Rate', value: `${currentData.summary.completion}%`, icon: BookOpen, color: 'from-green-500 to-green-600', iconBg: 'bg-green-100', iconColor: 'text-green-600' }
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-slate-700 font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-slate-600" style={{ color: entry.color || '#475569' }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Course Analytics Dashboard</h1>
          <p className="text-slate-600 text-lg">Monitor course performance, ratings, and student sentiment</p>
        </div>

        {dashboardData && (
          <div className="mb-8">
            <div className="bg-white/80 p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-orange-600" />
                <label className="text-slate-700 font-medium">Select Course:</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-slate-700"
                >
                  {Object.keys(dashboardData.summary).map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {topMetrics.map((metric, index) => (
            <div key={index} className="bg-white/80 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">{metric.title}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 ${metric.iconBg} rounded-lg`}>
                  <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/80 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Course Performance Summary</h3>
              <div className="space-y-4">
                {currentData.courses.map((course, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-700 mb-1">{course.course}</h4>
                    <div className="text-sm text-slate-600 flex gap-4">
                      <span>{course.students} students</span>
                      <span>{course.avgRating} rating</span>
                      <span>{course.totalReviews} reviews</span>
                    </div>
                    <div className="text-right text-green-600 font-bold mt-2">{course.completion}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={currentData.sentiment} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                    {currentData.sentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Monthly Rating Changes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={currentData.monthlyRating}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[3.5, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Monthly Sentiment Changes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={currentData.monthlySentiment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="positive" stackId="a" fill="#10B981" />
                  <Bar dataKey="neutral" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="negative" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

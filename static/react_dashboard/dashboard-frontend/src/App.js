import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './home';
import AdminLogin from './adminLogin';
import FeedbackForm from './feedbackForm';
import ThankYou from './thankyou';
import Dashboard from './dashboard';
import AdminMenu from './AdminMenu';
import TopicModeling from './TopicModeling';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/menu" element={
          <ProtectedRoute>
            <AdminMenu />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/topic-modeling" element={
          <ProtectedRoute>
            <TopicModeling />
          </ProtectedRoute>
        } />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/thankyou" element={<ThankYou />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
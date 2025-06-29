
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './home';
import AdminLogin from './adminLogin';
import FeedbackForm from './feedbackForm';
import ThankYou from './thankyou';
import Dashboard from './dashboard';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/thankyou" element={<ThankYou />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

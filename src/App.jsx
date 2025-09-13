import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import AutoLogin from './components/common/AutoLogin';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ConsumerPortal from './pages/ConsumerPortal';
import AdminPanel from './pages/AdminPanel';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
          <Router>
            <div className="app">
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><><Header /><Dashboard /></></ProtectedRoute>} />
                  <Route path="/consumer" element={<><Header /><ConsumerPortal /></>} />
                  <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><><Header /><AdminPanel /></></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

export default App;
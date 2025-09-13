import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import AutoLogin from './components/common/AutoLogin';
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
        <AutoLogin>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/consumer" element={<ConsumerPortal />} />
                  <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminPanel /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AutoLogin>
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
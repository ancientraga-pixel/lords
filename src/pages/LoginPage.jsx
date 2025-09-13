import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'Collector'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting login form with:', credentials);
    
    const result = await login(credentials);
    console.log('Login result:', result);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const roles = [
    { value: 'Collector', label: 'Collector/Farmer', icon: '🌱' },
    { value: 'LabTech', label: 'Lab Technician', icon: '🔬' },
    { value: 'Processor', label: 'Processor', icon: '⚙️' },
    { value: 'Manufacturer', label: 'Manufacturer', icon: '🏭' },
    { value: 'Admin', label: 'NMPB Admin', icon: '👨‍💼' }
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome to HERBIONYX</h1>
            <p>Blockchain-based Ayurvedic Herbs Traceability System</p>
            <div className="team-credits">
              <small>Developed by <strong>THE SENTINELS</strong></small>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username/Email</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="form-input glass-input"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-input glass-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Login As</label>
              <div className="role-selector">
                {roles.map(role => (
                  <label key={role.value} className={`role-option ${credentials.role === role.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={credentials.role === role.value}
                      onChange={handleChange}
                    />
                    <div className="role-content">
                      <span className="role-icon">{role.icon}</span>
                      <span className="role-label">{role.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="glass-button primary auth-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <a href="/register">Register here</a></p>
            
            <div className="developer-credentials">
              <h4>🧪 Developer/Tester Access</h4>
              <div className="cred-grid">
                <div className="cred-item">
                  <strong>👨‍💼 Admin:</strong> dev_admin / herbionyx2025
                </div>
                <div className="cred-item">
                  <strong>🌱 Collector:</strong> test_collector / test123
                </div>
                <div className="cred-item">
                  <strong>🔬 Lab Tech:</strong> test_labtech / test123
                </div>
                <div className="cred-item">
                  <strong>⚙️ Processor:</strong> test_processor / test123
                </div>
                <div className="cred-item">
                  <strong>🏭 Manufacturer:</strong> test_manufacturer / test123
                </div>
              </div>
            </div>
            
            <div className="blockchain-info">
              <div className="blockchain-badge">
                <span className="blockchain-icon">⛓️</span>
                <span>Powered by Hyperledger Fabric</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
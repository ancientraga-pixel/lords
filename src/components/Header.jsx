import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';
import './Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <div className="logo-img">
                <Leaf size={24} />
              </div>
              <span className="logo-text">HERBIONYX</span>
            </Link>
          </div>
          
          <nav className="nav">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/consumer" className="nav-link">Consumer Portal</Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="nav-link">Admin Panel</Link>
                )}
                <div className="user-menu">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/consumer" className="nav-link">Consumer Portal</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
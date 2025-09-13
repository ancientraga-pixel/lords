import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function AutoLogin({ children }) {
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (!isAuthenticated) {
        try {
          const response = await fetch('/api/auth/auto-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            const userData = await response.json();
            // Simulate login with auto-login data
            await login({ username: userData.username, password: 'auto' });
            console.log('Auto-login successful:', userData.name);
          }
        } catch (error) {
          console.log('Auto-login not available:', error);
        }
      }
    };

    // Only attempt auto-login in demo mode
    if (process.env.NODE_ENV === 'development') {
      attemptAutoLogin();
    }
  }, [isAuthenticated, login]);

  return children;
}

export default AutoLogin;
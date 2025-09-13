import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('herbionyx_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // Mock login bypass for quick access
    const mockUser = {
      id: `${credentials.role.toLowerCase()}_mock`,
      username: credentials.username || 'mock_user',
      name: credentials.username ? generateNameFromUsername(credentials.username) : 'Mock User',
      email: credentials.username && credentials.username.includes('@') ? credentials.username : 'mock@herbionyx.com',
      role: credentials.role,
      organization: getOrganizationByRole(credentials.role),
      approved: true,
      createdAt: new Date().toISOString()
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('herbionyx_user', JSON.stringify(mockUser));
    console.log('Mock login successful:', mockUser);
    return { success: true };
    
    // Original server login code (commented out)
    /*
    try {
      console.log('Attempting login with:', credentials);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Read response body only once
      let responseText;
      let responseData;
      try {
        responseText = await response.text();
        console.log('Raw response text:', responseText);
      } catch (textError) {
        console.error('Failed to read response:', textError);
        return { success: false, error: 'Failed to read server response' };
      }
      
      // Try to parse the text as JSON
      try {
        if (!responseText || responseText.trim() === '') {
          console.error('Empty response from server');
          return { success: false, error: 'Server returned empty response' };
        }
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Non-JSON response:', responseText);
        return { success: false, error: 'Invalid response format from server' };
      }
      
      console.log('Parsed response data:', responseData);
      
      if (response.ok) {
        setUser(responseData);
        setIsAuthenticated(true);
        localStorage.setItem('herbionyx_user', JSON.stringify(responseData));
        console.log('Login successful:', responseData);
        return { success: true };
      } else {
        console.error('Server error response:', responseData);
        return { success: false, error: responseData.error || `Server error: ${response.status}` };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: `Network error: ${error.message}` };
    }
    */
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        return { success: true, message: 'Registration submitted for approval' };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('herbionyx_user');
  };

  // Helper functions for mock login
  const generateNameFromUsername = (username) => {
    if (username.includes('@')) {
      const name = username.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const getOrganizationByRole = (role) => {
    const orgMap = {
      'Collector': 'FarmersCoop',
      'LabTech': 'QualityLabs',
      'Processor': 'HerbProcessors',
      'Manufacturer': 'AyurMeds',
      'Admin': 'NMPB'
    };
    return orgMap[role] || 'Unknown';
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
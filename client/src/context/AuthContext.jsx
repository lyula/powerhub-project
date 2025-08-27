import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api/auth';

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.data.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token and user data
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update user state with new data
      setUser(data.data.user);

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

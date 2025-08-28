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
  const [serverConnected, setServerConnected] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const CHANNEL_API_URL = API_BASE_URL + '/channel/me';

  // Helper function to check server connectivity
  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'HEAD', // Use HEAD to check if server is responding
        headers: { 'Content-Type': 'application/json' }
      });
      // Server is connected if we get any HTTP response (even 401 is fine for connectivity check)
      setServerConnected(true);
      return true;
    } catch (error) {
      // Only network errors (fetch failures) indicate server is down
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setServerConnected(false);
        console.error('Server connectivity check failed - network error:', error);
        return false;
      }
      // Other errors still mean server is reachable
      setServerConnected(true);
      return true;
    }
  };

  // Check if user is authenticated on app load
  const [channel, setChannel] = useState(null);
  // const CHANNEL_API_URL = import.meta.env.VITE_API_BASE_URL + '/api/channel/me';
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        // First check if server is reachable
        const isConnected = await checkServerConnection();
        if (!isConnected) {
          console.warn('Server is not reachable. Skipping auth check.');
          setLoading(false);
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          let userData = null;
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              userData = data.data.user;
              setUser(userData);
            } else {
              // Server returned non-JSON response
              console.error('Auth endpoint returned non-JSON response');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
          // Always fetch channel info after user check
          try {
            const channelRes = await fetch(CHANNEL_API_URL, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (channelRes.ok) {
              const contentType = channelRes.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const channelData = await channelRes.json();
                // Only set channel if valid object with _id
                if (channelData && channelData._id) {
                  setChannel(channelData);
                } else {
                  setChannel(null);
                }
              } else {
                console.error('Channel endpoint returned non-JSON response');
                setChannel(null);
              }
            } else if (channelRes.status === 404) {
              // 404 is expected when user doesn't have a channel yet
              console.log('User does not have a channel yet (404)');
              setChannel(null);
            } else {
              console.error('Channel fetch failed with status:', channelRes.status);
              setChannel(null);
            }
          } catch (err) {
            setChannel(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // Check if it's a network error
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error: Unable to connect to server. Please check if the server is running.');
          } else if (error.message.includes('JSON.parse')) {
            console.error('Server response error: Expected JSON but received non-JSON response. This usually means the server is not running or returned an error page.');
          } else if (error.message.includes('non-JSON response')) {
            console.error('Server configuration error: API endpoint returned non-JSON response.');
          }
          
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setChannel(null);
        }
      } else {
        setChannel(null);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

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
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

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
  await fetch(`${API_BASE_URL}/auth/logout`, {
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
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

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
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

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
    channel,
    setChannel,
    serverConnected,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

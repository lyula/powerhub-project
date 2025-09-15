import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken && storedToken !== 'null' ? storedToken : null;
  });
  const [loading, setLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      // Only redirect if not on public routes
      const currentPath = location?.pathname || '';
      const publicPaths = ['/', '/login', '/register', '/terms', '/interests', '/forgot-password', '/forgot-password-verify', '/reset-password'];
      if (!publicPaths.includes(currentPath)) {
        navigate('/login', { replace: true });
      }
    }
    // Do not restrict access to public routes for unauthenticated users
  }, [loading, user, location, navigate]);

  // Check maintenance mode when user logs in
  useEffect(() => {
    if (token && user) {
      checkMaintenanceMode();
    }
  }, [token, user]);

  // Real-time maintenance mode monitoring
  useEffect(() => {
    let intervalId;
    let maintenanceCheckInterval;
    
    if (token && user && user.role !== 'IT' && user.role !== 'admin') {
      // First, check if maintenance mode is already enabled
      const checkMaintenanceAndSession = async () => {
        try {
          // Check maintenance status first (no auth required)
          const maintenanceResponse = await fetch(`${API_BASE_URL}/it-dashboard/maintenance-status`);
          if (maintenanceResponse.ok) {
            const maintenanceData = await maintenanceResponse.json();
            if (maintenanceData.data?.maintenanceMode?.enabled) {
              // Maintenance mode is enabled, check if user session is still valid
              const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (authResponse.status === 401) {
                const authData = await authResponse.json();
                if (authData.sessionInvalidated && authData.maintenanceMode) {
                  // User session was invalidated due to maintenance mode
                  handleMaintenanceLogout();
                  return true; // Indicate logout occurred
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking maintenance and session status:', error);
        }
        return false; // No logout occurred
      };
      
      // Initial check
      checkMaintenanceAndSession();
      
      // Poll every 2 seconds for maintenance mode changes
      intervalId = setInterval(async () => {
        const loggedOut = await checkMaintenanceAndSession();
        if (loggedOut) {
          clearInterval(intervalId);
          if (maintenanceCheckInterval) {
            clearInterval(maintenanceCheckInterval);
          }
        }
      }, 2000);
      
      // Also poll maintenance status every 1 second when maintenance mode is detected
      maintenanceCheckInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/it-dashboard/maintenance-status`);
          if (response.ok) {
            const data = await response.json();
            if (data.data?.maintenanceMode?.enabled) {
              // Maintenance mode is active, check session immediately
              const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (authResponse.status === 401) {
                const authData = await authResponse.json();
                if (authData.sessionInvalidated && authData.maintenanceMode) {
                  handleMaintenanceLogout();
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking maintenance status:', error);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (maintenanceCheckInterval) {
        clearInterval(maintenanceCheckInterval);
      }
    };
  }, [token, user, navigate]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const CHANNEL_API_URL = API_BASE_URL + '/channel/me';

  // Helper function to handle maintenance mode logout
  const handleMaintenanceLogout = () => {
    console.log('Handling maintenance mode logout');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    navigate('/login', { 
      state: { 
        message: 'You have been logged out due to system maintenance.',
        maintenanceMode: true 
      } 
    });
  };

  // Helper function to check server connectivity
  const checkServerConnection = async () => {
    try {
      // Use public health endpoint for connectivity check
      const healthUrl = API_BASE_URL.replace(/\/api$/, '') + '/api/health/ping';
      const response = await fetch(healthUrl);
      if (response.ok) {
        setServerConnected(true);
        return true;
      } else {
        setServerConnected(false);
        return false;
      }
    } catch (error) {
      setServerConnected(false);
      console.error('Server connectivity check failed - network error:', error);
      return false;
      }
    };

  // Helper function to check maintenance mode
  const checkMaintenanceMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.maintenanceMode) {
          setMaintenanceMode(data.data.maintenanceMode.enabled);
          setMaintenanceMessage(data.data.maintenanceMode.message);
        }
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
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
              setIsAuthenticated(true);
            } else {
              // Server returned non-JSON response
              console.error('Auth endpoint returned non-JSON response');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Parse response for error handling
            let data = {};
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                data = await response.json();
              }
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
            }
            
            if (response.status === 401) {
              // Unauthorized: treat as not logged in
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
              localStorage.removeItem('token');
            } else if (response.status === 503 && data.maintenanceMode) {
              // Maintenance mode
              setMaintenanceMode(true);
              setMaintenanceMessage(data.message);
              // Don't log out IT users during maintenance
              if (userData && (userData.role === 'IT' || userData.role === 'admin')) {
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                handleMaintenanceLogout();
              }
            } else {
              // Other errors
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
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
          setIsAuthenticated(false);
          setChannel(null);
        }
      } else {
        setChannel(null);
        setUser(null);
        setIsAuthenticated(false);
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
        if (response.status === 503 && data.maintenanceMode) {
          // Maintenance mode
          setMaintenanceMode(true);
          setMaintenanceMessage(data.message);
          throw new Error('System is under maintenance. Please try again later.');
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      }

      // Don't save token and user data - require manual login
      // localStorage.setItem('token', data.data.token);
      // setToken(data.data.token);
      // setUser(data.data.user);

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
        // Handle specific error cases
        if (response.status === 423) {
          // Account locked
          throw new Error(data.message || 'Account is locked due to too many failed attempts');
        } else if (response.status === 403 && data.requiresPasswordChange) {
          // Password expired
          throw new Error('Password has expired. Please change your password.');
        } else if (response.status === 403 && data.suspended) {
          // Account suspended
          throw new Error(data.message || 'Your account has been suspended and is under review.');
        } else if (response.status === 503 && data.maintenanceMode) {
          // Maintenance mode
          setMaintenanceMode(true);
          setMaintenanceMessage(data.message);
          throw new Error('System is under maintenance. Please try again later.');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }

      // Save token and user data
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      setIsAuthenticated(true);

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token && token !== 'null') {
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
      localStorage.removeItem('user'); // Also remove user data if stored
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setChannel(null);
      navigate('/login');
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

  // Get default secret questions
  const getSecretQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/secret-questions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load questions');
      return { success: true, questions: data.data.questions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reset password with secret question (single step)
  const resetPasswordWithSecret = async ({ email, secretQuestionKey, secretAnswer, newPassword }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretQuestionKey, secretAnswer, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password reset failed');
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Two-step: verify secret to get reset token
  const verifyResetSecret = async ({ email, secretQuestionKey, secretAnswer }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretQuestionKey, secretAnswer })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, status: response.status, message: data.message, remainingAttempts: data.remainingAttempts, lockedUntil: data.lockedUntil };
      }
      return { success: true, resetToken: data.data.resetToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Two-step: complete password reset with token
  const completeResetWithToken = async ({ resetToken, newPassword }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password reset failed');
      return { success: true, message: data.message };
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
    getSecretQuestions,
    resetPasswordWithSecret,
    verifyResetSecret,
    completeResetWithToken,
    channel,
    setChannel,
    serverConnected,
    maintenanceMode,
    maintenanceMessage,
    checkMaintenanceMode,
    isAuthenticated: isAuthenticated,
    uploadProfilePicture: async (file) => {
      // Upload image directly to Cloudinary
      const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
      const CLOUDINARY_IMAGE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      try {
        const cloudRes = await fetch(CLOUDINARY_IMAGE_URL, {
          method: 'POST',
          body: formData
        });
        const cloudData = await cloudRes.json();
        if (!cloudRes.ok || !cloudData.secure_url) throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
        // Send only the Cloudinary URL to backend
        const response = await fetch(`${API_BASE_URL}/profile/upload-profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl: cloudData.secure_url })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Profile update failed');
        setUser(data.user);
        return { success: true, url: data.url, user: data.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
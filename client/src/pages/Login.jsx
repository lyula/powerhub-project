import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import PWABanner from '../components/PWABanner';

import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [maintenanceLogoutMessage, setMaintenanceLogoutMessage] = useState('');

  // Check for maintenance logout message from location state
  useEffect(() => {
    if (location.state?.maintenanceMode && location.state?.message) {
      setMaintenanceLogoutMessage(location.state.message);
      setMaintenanceMode(true);
    }
  }, [location.state]);

  // Check maintenance mode on component mount
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/it-dashboard/maintenance-status`, {
          method: 'GET',
          headers: {
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
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // All users (including IT) redirect to home page
        navigate('/home');
      } else {
        // Don't show error message if maintenance mode is active
        if (!maintenanceMode) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      // Don't show error message if maintenance mode is active
      if (!maintenanceMode) {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking maintenance mode
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
        <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
          <p className="text-center text-base" style={{ color: colors.secondary }}>Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
        <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight" style={{ color: colors.primary }}>PowerHub Login</h1>
          <p className="text-center text-base mb-4" style={{ color: colors.secondary }}>Welcome to PLP PowerHub</p>
          
          {/* Maintenance Mode Banner */}
          {maintenanceMode && (
            <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-amber-900">System Under Maintenance</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {maintenanceLogoutMessage || maintenanceMessage || 'System is under maintenance. Please try again later.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && !maintenanceMode && (
            <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form className="flex flex-col gap-5 w-full items-center justify-center" onSubmit={handleSubmit}>
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
            />
            <PasswordInput
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="w-full text-right -mt-2">
              <Link to="/forgot-password-verify" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md mb-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
                  <span>Signing In</span>
                </>
              ) : 'Sign In'}
            </button>
          </form>
          <div className="flex flex-col items-center gap-4 w-full">
            <button className="flex items-center gap-2 py-3 px-6 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white font-bold shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition w-full justify-center">
              <GoogleIcon /> Sign in with Google
            </button>
            <Link 
              to="/register" 
              className="text-sm font-semibold hover:underline" 
              style={{ color: colors.secondary }}
            >
              Don't have an account? Register
            </Link>
            {/* PWABanner should always be directly below the register link */}
            <PWABanner />
          </div>
        </div>
      </div>
    </>
  );
}



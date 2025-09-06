import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

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
      const result = await register(formData);
      
      if (result.success) {
        // Redirect based on user role
        if (result.data.user.role === 'IT') {
          navigate('/it-dashboard');
        } else {
          navigate('/home');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

  // Show maintenance mode message if enabled
  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
        <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
          <div className="w-full p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <svg className="w-16 h-16 text-amber-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold text-amber-900 mb-3">Registration Temporarily Disabled</h2>
            <p className="text-amber-700 mb-4">
              {maintenanceMessage || 'The system is currently under maintenance. Registration is temporarily disabled.'}
            </p>
            <p className="text-sm text-amber-600 mb-6">
              Please try again later or contact support if you need immediate access.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight" style={{ color: colors.secondary }}>Join PowerHub</h1>
        <p className="text-center text-base mb-4" style={{ color: colors.primary }}>Create your PLP PowerHub account</p>
        
        {error && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-5 w-full items-center justify-center" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username"
            placeholder="Username" 
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <input 
            type="text" 
            name="firstName"
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <input 
            type="text" 
            name="lastName"
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <select 
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md mb-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
                <span>Creating Account</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>
        
        <div className="flex flex-col items-center gap-4 w-full mt-2">
          <button className="flex items-center gap-2 py-3 px-6 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white font-bold shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition w-full justify-center">
            <GoogleIcon /> Sign up with Google
          </button>
          <Link to="/login" className="text-sm font-semibold hover:underline" style={{ color: colors.primary }}>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}



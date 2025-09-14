import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, getSecretQuestions } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: '',
    secretQuestionKey: '',
    secretAnswer: ''
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  // Load questions
  useEffect(() => {
    // Check for error message from interests page
    if (location.state?.error) {
      setError(location.state.error);
    }
    
    (async () => {
      const res = await getSecretQuestions();
      if (res.success) {
        setQuestions(res.questions);
        if (res.questions.length > 0) {
          setFormData(fd => ({ ...fd, secretQuestionKey: res.questions[0].key }));
        }
      }
    })();
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

    // Validate terms acceptance
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to create an account.');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Store temporary token for interests selection
        if (result.data.tempToken) {
          localStorage.setItem('registrationToken', result.data.tempToken);
        }
        
        // Redirect to interests selection page with user data
        navigate('/interests', {
          state: {
            userData: result.data.user,
            tempToken: result.data.tempToken,
            message: 'Registration successful! Let\'s personalize your experience.'
          }
        });
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
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121]">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create account</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Secret question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Secret question</label>
            <select
              name="secretQuestionKey"
              value={formData.secretQuestionKey}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            >
              {questions.map(q => (
                <option key={q.key} value={q.key}>{q.text}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Your answer</label>
            <input
              type="text"
              name="secretAnswer"
              value={formData.secretAnswer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 pt-4">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded focus:ring-2 focus:ring-offset-0 border-gray-300 dark:border-gray-600"
              style={{ 
                accentColor: colors.primary,
                color: colors.primary 
              }}
              required
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-700 dark:text-gray-300">
              I have read and agreed to the{' '}
              <Link 
                to="/terms" 
                className="font-medium hover:underline"
                style={{ color: colors.primary }}
              >
                Terms and Conditions
              </Link>
              {' '} of this platform.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className={`w-full py-2 mt-4 rounded-lg text-white font-semibold transition-opacity ${
              (!termsAccepted || loading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium hover:underline"
              style={{ color: colors.primary }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



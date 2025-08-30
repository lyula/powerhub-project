import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight" style={{ color: colors.primary }}>PowerHub Login</h1>
        <p className="text-center text-base mb-4" style={{ color: colors.secondary }}>Welcome to PLP PowerHub</p>
        
        {error && (
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
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md mb-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
        </div>
      </div>
    </div>
  );
}



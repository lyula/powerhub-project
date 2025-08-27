import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import { colors } from '../theme/colors';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight" style={{ color: colors.primary }}>PowerHub Login</h1>
        <p className="text-center text-base mb-4" style={{ color: colors.secondary }}>Welcome to PLP PowerHub</p>
        <form className="flex flex-col gap-5 w-full items-center justify-center" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[${colors.primary}] placeholder-gray-400" />
          <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[${colors.primary}] placeholder-gray-400" />
          <button type="submit" className="w-full py-3 rounded-lg bg-[${colors.primary}] text-white font-bold hover:bg-[${colors.secondary}] transition shadow-md mb-2">Sign In</button>
        </form>
        <div className="flex flex-col items-center gap-4 w-full">
          <button className="flex items-center gap-2 py-3 px-6 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white font-bold shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition w-full justify-center">
            <GoogleIcon /> Sign in with Google
          </button>
          <Link to="/register" className="text-sm font-semibold hover:underline" style={{ color: colors.secondary }}>Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeResetWithToken } = useAuth();

  const resetToken = location.state?.resetToken;
  const email = location.state?.email; // Optional display

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password-verify', { replace: true });
    }
  }, [resetToken, navigate]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const res = await completeResetWithToken({ resetToken, newPassword });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Password reset failed');
      return;
    }
    setSuccess('Success — password reset successfully');
    setTimeout(() => navigate('/login', { replace: true }), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121]">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Set new password</h1>
        {email && (
          <p className="text-sm mb-2 text-gray-600 dark:text-gray-300">Account: {email}</p>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-md text-sm font-semibold bg-green-600 text-white border border-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-md text-sm font-semibold bg-red-600 text-white border border-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">New password</label>
            <PasswordInput
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
} 
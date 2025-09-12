import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function ForgotPasswordVerify() {
  const navigate = useNavigate();
  const { getSecretQuestions, verifyResetSecret } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    email: '',
    secretQuestionKey: '',
    secretAnswer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockedMessage, setLockedMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getSecretQuestions();
      if (res.success) {
        setQuestions(res.questions);
        if (res.questions.length > 0) {
          setForm(f => ({ ...f, secretQuestionKey: res.questions[0].key }));
        }
      } else {
        setError(res.error || 'Unable to load secret questions');
      }
    })();
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setAttemptsLeft(null);
    setLockedMessage('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAttemptsLeft(null);
    setLockedMessage('');
    const res = await verifyResetSecret(form);
    setLoading(false);
    if (!res.success) {
      // Show specific messages if available
      if (res.lockedUntil || res.status === 423) {
        setLockedMessage(res.message || 'Too many failed attempts. Try again in 10 minutes.');
      } else {
        setError(res.message || res.error || 'Verification failed');
        if (typeof res.remainingAttempts === 'number') setAttemptsLeft(res.remainingAttempts);
      }
      return;
    }
    navigate('/reset-password', { state: { resetToken: res.resetToken, email: form.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121]">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Verify identity</h1>
        {lockedMessage && (
          <div className="mb-4 p-3 rounded-md text-sm font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            {lockedMessage}
          </div>
        )}
        {error && (
          <div className="mb-2 p-3 rounded-md text-sm font-semibold bg-red-600 text-white border border-red-700">
            {error}
          </div>
        )}
        {attemptsLeft !== null && !lockedMessage && (
          <div className="mb-4 text-xs text-gray-700 dark:text-gray-300">Attempts left: {attemptsLeft}</div>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              style={{ outlineColor: colors.primary }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Secret question</label>
            <select
              name="secretQuestionKey"
              value={form.secretQuestionKey}
              onChange={handleChange}
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
              value={form.secretAnswer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
} 
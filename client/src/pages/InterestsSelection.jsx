import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../theme/colors';

const availableInterests = [
  { id: 'ai-machine-learning', label: 'AI & Machine Learning', icon: '🤖', description: 'Python, TensorFlow, PyTorch projects' },
  { id: 'mobile-app-development', label: 'Mobile App Development', icon: '�', description: 'Dart, Flutter, React Native' },
  { id: 'mern-stack', label: 'MERN Stack', icon: '⚛️', description: 'MongoDB, Express, React, Node.js' },
  { id: 'python-development', label: 'Python Development', icon: '🐍', description: 'Django, Flask, FastAPI projects' },
  { id: 'web-development', label: 'Web Development', icon: '�', description: 'HTML, CSS, JavaScript, PHP' },
  { id: 'devops-cloud', label: 'DevOps & Cloud', icon: '☁️', description: 'Docker, Kubernetes, AWS, Azure' },
  { id: 'data-science', label: 'Data Science', icon: '📊', description: 'Pandas, NumPy, Jupyter, R' },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️', description: 'Solidity, Web3, Smart Contracts' },
  { id: 'game-development', label: 'Game Development', icon: '🎮', description: 'Unity, Unreal Engine, C#' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒', description: 'Penetration Testing, Ethical Hacking' }
];

export default function InterestsSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);

  // Get user data and token from registration (if available)
  const userData = location.state?.userData;
  const tempToken = location.state?.tempToken || localStorage.getItem('registrationToken');

  // Validate token on component mount
  useEffect(() => {
    if (!tempToken) {
      // No token, redirect to register page
      navigate('/register', { 
        state: { error: 'Registration session expired. Please register again.' }
      });
      return;
    }
    
    // For now, just mark as validated
    // In a more robust implementation, you could verify the token with the server
    setValidatingToken(false);
  }, [tempToken, navigate]);

  // Show loading while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
        <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121] flex flex-col items-center justify-center gap-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-center text-base text-gray-600 dark:text-gray-400">Validating registration...</p>
        </div>
      </div>
    );
  }

  const handleInterestToggle = (interestId) => {
    const interest = availableInterests.find(i => i.id === interestId);
    const interestName = interest.label;
    
    setSelectedInterests(prev => 
      prev.includes(interestName)
        ? prev.filter(name => name !== interestName)
        : [...prev, interestName]
    );
  };

  const handleSaveInterests = async () => {
    // Clean up registration token first
    localStorage.removeItem('registrationToken');
    
    if (selectedInterests.length === 0) {
      // If no interests selected, just proceed to login
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in to continue.' }
      });
      return;
    }

    setLoading(true);
    
    try {
      // Save interests to backend using temp token
      if (tempToken) {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/user/interests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tempToken: tempToken,
            interests: selectedInterests
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save interests');
        }
      }
    } catch (error) {
      console.error('Error saving interests:', error);
    } finally {
      setLoading(false);
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in to continue.' }
      });
    }
  };

  const handleSkip = () => {
    // Clean up registration token
    localStorage.removeItem('registrationToken');
    
    navigate('/login', { 
      state: { message: 'Registration successful! Please sign in to continue.' }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#181818]">
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[#212121]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            What interests you?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select topics you're interested in to help us recommend better content for you.
            You can always change these later in your profile settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          {availableInterests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left ${
                selectedInterests.includes(interest.label)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{interest.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1">{interest.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {interest.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          {selectedInterests.length > 0 && (
            <p>{selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSaveInterests}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? 'Saving...' : selectedInterests.length > 0 ? 'Save & Continue' : 'Continue'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium hover:underline"
              style={{ color: colors.primary }}
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

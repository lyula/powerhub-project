
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProgressBar from './components/ProgressBar';
import useRouteLoader from './hooks/useRouteLoader';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UploadVideo from './pages/UploadVideo';
import ChannelSetup from './pages/ChannelSetup';
import CreatePost from './pages/CreatePost';
import ChannelProfile from './pages/ChannelProfile';
import Watch from './pages/Watch';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, serverConnected } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#181818]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          {!serverConnected && (
            <p className="mt-2 text-red-500 text-sm">
              Server connection issue. Please ensure the server is running on port 5000.
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, serverConnected } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#181818]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          {!serverConnected && (
            <p className="mt-2 text-red-500 text-sm">
              Server connection issue. Please ensure the server is running on port 5000.
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

// Dummy hook to check if user has a channel (replace with real logic)


function AppRoutes() {
  const { channel } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/upload" element={channel ? <ProtectedRoute><UploadVideo /></ProtectedRoute> : <Navigate to="/channel-setup" replace />} />
      <Route path="/channel-setup" element={channel ? <Navigate to="/home" replace /> : <ProtectedRoute><ChannelSetup /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/channel/:author" element={<ProtectedRoute><ChannelProfile /></ProtectedRoute>} />
      <Route path="/watch/:id" element={<ProtectedRoute><Watch /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const loading = useRouteLoader();
  return (
    <AuthProvider>
      <ProgressBar loading={loading} />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

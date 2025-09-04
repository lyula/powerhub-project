
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
// import Trending from './pages/Trending';
import Specializations from './pages/Specializations';
import Subscriptions from './pages/Subscriptions';
import SavedVideos from './pages/SavedVideos';
import LikedVideos from './pages/LikedVideos';
import CourseVideos from './pages/CourseVideos';
import WatchHistory from './pages/WatchHistory';
import Notifications from './pages/Notifications';
import LandingPage from './pages/LandingPage';
import PostDetails from './pages/PostDetails';

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
  const location = window.location.pathname;
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
  // Only redirect if authenticated and on /login or /register
  if (isAuthenticated && (location === '/login' || location === '/register')) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Dummy hook to check if user has a channel (replace with real logic)


function AppRoutes() {
  const { channel } = useAuth();
  // Helper to get query string
  const getQuery = () => {
    if (typeof window !== 'undefined') {
      return window.location.search;
    }
    return '';
  };
  const isEditingChannel = getQuery().includes('edit=true');
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/upload" element={channel ? <ProtectedRoute><UploadVideo /></ProtectedRoute> : <Navigate to="/channel-setup" replace />} />
      <Route path="/channel-setup" element={channel && !isEditingChannel ? <Navigate to="/home" replace /> : <ProtectedRoute><ChannelSetup /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/channel/:author" element={<ProtectedRoute><ChannelProfile /></ProtectedRoute>} />
      <Route path="/watch/:id" element={<ProtectedRoute><Watch /></ProtectedRoute>} />
      {/* Sidebar Placeholder Pages */}
      {/* <Route path="/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} /> */}
      <Route path="/specializations" element={<ProtectedRoute><Specializations /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
      <Route path="/saved-videos" element={<ProtectedRoute><SavedVideos /></ProtectedRoute>} />
      <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
      <Route path="/course-videos" element={<ProtectedRoute><CourseVideos /></ProtectedRoute>} />
      <Route path="/watch-history" element={<ProtectedRoute><WatchHistory /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/post/:postId" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
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

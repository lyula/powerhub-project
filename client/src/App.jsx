import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { trackPageVisit } from './utils/analytics';
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
import ITDashboard from './pages/ITDashboard'; // Added ITDashboard import
import MaintenancePage from './pages/MaintenancePage';
import MobileCollaborationsPage from './pages/MobileCollaborations';
import MobileCollaborationOptions from './pages/MobileCollaborationOptions';

// Protected Route Component
const ProtectedRoute = ({ children, requireRegularUser = false }) => {
  const { isAuthenticated, loading, serverConnected, user, maintenanceMode, maintenanceMessage } = useAuth();
  
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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check maintenance mode - only IT users can access during maintenance
  if (maintenanceMode && user && user.role !== 'IT' && user.role !== 'admin') {
    // Don't show maintenance page - let the AuthContext handle logout
    // This will be handled by the real-time polling in AuthContext
    return null;
  }
  
  // If this route requires regular users and the user is IT, redirect to IT dashboard
  if (requireRegularUser && user && user.role === 'IT') {
    return <Navigate to="/it-dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, serverConnected, user, maintenanceMode, maintenanceMessage } = useAuth();
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
  
  // Check maintenance mode for authenticated users - only IT users can access during maintenance
  if (isAuthenticated && maintenanceMode && user && user.role !== 'IT' && user.role !== 'admin') {
    // Don't show maintenance page - let the AuthContext handle logout
    // This will be handled by the real-time polling in AuthContext
    return null;
  }
  
  // Only redirect if authenticated and on /login or /register
  if (isAuthenticated && (location === '/login' || location === '/register')) {
    // Redirect based on user role
    if (user && user.role === 'IT') {
      return <Navigate to="/it-dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  return children;
};

// Component to track page visits
const PageTracker = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Track page visit for authenticated users
      trackPageVisit(location.pathname);
    }
  }, [location.pathname, isAuthenticated, user]);

  return null;
};

function AppRoutes() {
  const { channel } = useAuth();
  return (
    <>
      <PageTracker />
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/upload" element={channel ? <ProtectedRoute><UploadVideo /></ProtectedRoute> : <Navigate to="/channel-setup" replace />} />
        <Route path="/channel-setup" element={<ProtectedRoute><ChannelSetup /></ProtectedRoute>} />
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
        <Route path="/it-dashboard" element={<ProtectedRoute><ITDashboard /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
        <Route path="/mobile-collaboration-options" element={<ProtectedRoute><MobileCollaborationOptions /></ProtectedRoute>} />
        <Route path="/mobile-collaborations/:categoryName" element={<ProtectedRoute><MobileCollaborationsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
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
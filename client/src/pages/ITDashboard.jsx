import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { trackButtonClick } from '../utils/analytics';
import { FormattedNumber, FormattedSessionDuration } from '../utils/numberFormatter.jsx';
import ReviewContentModal from '../components/ReviewContentModal';
import { colors } from '../theme/colors';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);
import { 
  MdDashboard, 
  MdSettings, 
  MdPeople, 
  MdSecurity, 
  MdFlag, 
  MdAnalytics,
  MdLogout,
  MdMenu,
  MdClose,
  MdHistory,
  MdTrendingUp,
  MdBlock,
  MdBarChart
} from 'react-icons/md';

const ITDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemOverview, setSystemOverview] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [suspendedUsersCount, setSuspendedUsersCount] = useState(0);
  const [securityOverview, setSecurityOverview] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // System health state
  const [systemHealth, setSystemHealth] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  
  // Audit logs pagination state
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditLogsPerPage] = useState(15);
  const [auditTotalLogs, setAuditTotalLogs] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Advanced analytics state
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('7d'); // 7d, 30d, 90d, 1y

  // Debug logging
  console.log('ITDashboard rendered with user:', user);
  console.log('Loading state:', loading);
  console.log('System overview:', systemOverview);

  // Function to manually trigger analytics refresh
  const refreshAnalytics = async () => {
    try {
      await loadOverview();
      console.log('Analytics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Helper function to get valid token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      // Clean up invalid token and logout user
      console.log('Invalid token detected, logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      handleLogout();
      return null;
    }
    return token;
  };

  // Helper function to format minutes into readable time
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0h 0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    // Role check is now handled at the route level
    if (user) {
      loadOverview();
    }
  }, [user]);

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, activeTab, currentPage, auditCurrentPage]);

  // Search users with debounced API calls
  useEffect(() => {
    const searchUsers = async () => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/it-dashboard/users?search=${encodeURIComponent(userSearchTerm)}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFilteredUsers(data.data.users);
    } else {
          console.error('Search failed:', response.status);
          // Fallback to local filtering if API fails
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
      } catch (error) {
        console.error('Error searching users:', error);
        // Fallback to local filtering if API fails
        const filtered = users.filter(user => 
          user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, users]);

  const loadOverview = async (showLoading = true) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found');
        // Don't navigate here - let the auth context handle it
        return;
      }

      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`${API_BASE_URL}/it-dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemOverview(data.data.metrics);
        setMaintenanceMode(data.data.maintenanceMode.enabled);
        setMaintenanceMessage(data.data.maintenanceMode.message);
      } else {
        const errorText = await response.text();
        console.error('Overview request failed:', response.status, errorText);
      }
      
      // Load additional data
      loadSuspendedUsers();
      loadAllUsersForStats();
      loadSystemHealth();
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Refresh maintenance mode status
  const refreshMaintenanceStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.data.maintenanceMode.enabled);
        setMaintenanceMessage(data.data.maintenanceMode.message);
      }
    } catch (error) {
      console.error('Error refreshing maintenance status:', error);
    }
  };

  const loadFlaggedContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/flagged-content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFlaggedContent(data.data.flaggedContent);
      }
    } catch (error) {
      console.error('Error loading flagged content:', error);
    }
  };

  const loadUsers = async (page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/users?page=${page}&limit=${usersPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.total);
        setTotalUsers(data.data.pagination.totalUsers || data.data.pagination.total * usersPerPage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSuspendedUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/users?status=suspended&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuspendedUsers(data.data.users);
        setSuspendedUsersCount(data.data.users.length);
      }
    } catch (error) {
      console.error('Error loading suspended users:', error);
    }
  };

  const loadAllUsersForStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/users?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error loading all users for stats:', error);
    }
  };

  const refreshAllData = async (showLoading = false) => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      // Refresh data based on current active tab
      switch (activeTab) {
        case 'overview':
          await loadOverview(showLoading);
          break;
        case 'analytics':
          await loadAdvancedAnalytics(analyticsDateRange);
          break;
        case 'advanced-analytics':
          await loadAdvancedAnalytics(analyticsDateRange);
          break;
        case 'security':
          await loadSecurityOverview();
          await loadSystemHealth(showLoading);
          await loadSecurityAlerts();
          await loadRecentActivities();
          break;
        case 'users':
          await loadUsers(currentPage);
          await loadAllUsersForStats();
          break;
        case 'suspended-users':
          await loadSuspendedUsers();
          break;
        case 'flagged':
          await loadFlaggedContent();
          break;
        case 'audit':
          await loadAuditLogs(auditCurrentPage, showLoading);
          break;
        case 'maintenance':
          await refreshMaintenanceStatus();
          break;
        default:
          await loadOverview(showLoading);
      }
      
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadSecurityOverview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/security`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityOverview(data.data);
      }
    } catch (error) {
      console.error('Error loading security overview:', error);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/maintenance/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !maintenanceMode,
          message: maintenanceMessage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.data.enabled);
        setMaintenanceMessage(data.data.message);
        alert(`Maintenance mode ${data.data.enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const reviewFlaggedContent = async (contentId, status, action, notes, banDuration) => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/flagged-content/${contentId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, action, notes, banDuration })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Show appropriate success message
        let message = 'Content reviewed successfully';
        if (action === 'remove') {
          message = 'Content removed and user notified';
        } else if (action === 'warn') {
          message = 'User warned successfully';
        } else if (action === 'ban_user') {
          message = 'User banned successfully';
        } else if (status === 'dismissed') {
          message = 'Report dismissed successfully';
        }
        
        alert(message);
        
        // Refresh the flagged content list
        await loadFlaggedContent();
        
        return true;
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error reviewing content');
        return false;
      }
    } catch (error) {
      console.error('Error reviewing content:', error);
      alert('Error reviewing content');
      return false;
    }
  };

  // Open review modal
  const openReviewModal = (content) => {
    setSelectedContent(content);
    setReviewModalOpen(true);
  };

  // Close review modal
  const closeReviewModal = () => {
    setSelectedContent(null);
    setReviewModalOpen(false);
  };

  // Load system health
  const loadSystemHealth = async (showLoading = true) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found for system health');
        return;
      }

      if (showLoading) {
        setHealthLoading(true);
      }
      console.log('Loading system health...');
      const response = await fetch(`${API_BASE_URL}/it-dashboard/system-health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('System health response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('System health data received:', data);
        setSystemHealth(data.data);
      } else {
        const errorText = await response.text();
        console.error('System health error response:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading system health:', error);
    } finally {
      if (showLoading) {
        setHealthLoading(false);
      }
    }
  };

  // Load security alerts
  const loadSecurityAlerts = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found for security alerts');
        return;
      }

      console.log('Loading security alerts...');
      const response = await fetch(`${API_BASE_URL}/it-dashboard/security-alerts?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Security alerts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Security alerts data received:', data);
        setSecurityAlerts(data.data.alerts || []);
      } else {
        const errorText = await response.text();
        console.error('Security alerts error response:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  };

  // Load recent activities
  const loadRecentActivities = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found for recent activities');
        return;
      }

      console.log('Loading recent activities...');
      const response = await fetch(`${API_BASE_URL}/it-dashboard/recent-activities?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Recent activities response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Recent activities data received:', data);
        setRecentActivities(data.data.activities || []);
      } else {
        const errorText = await response.text();
        console.error('Recent activities error response:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  // Load audit logs with pagination
  const loadAuditLogs = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setAuditLoading(true);
      }
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found for audit logs');
        return;
      }

      console.log('Loading audit logs for page:', page);
      const response = await fetch(`${API_BASE_URL}/it-dashboard/audit-logs?page=${page}&limit=${auditLogsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Audit logs data:', data);
        setAuditLogs(data.data.logs || []);
        
        // Update pagination state
        if (data.data.pagination) {
          setAuditCurrentPage(data.data.pagination.current);
          setAuditTotalPages(data.data.pagination.total);
          setAuditTotalLogs(data.data.pagination.totalRecords || 0);
        }
      } else {
        const errorText = await response.text();
        console.error('Audit logs error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      if (showLoading) {
        setAuditLoading(false);
      }
    }
  };

  // Load advanced analytics
  const loadAdvancedAnalytics = async (dateRange = '7d') => {
    try {
      setAnalyticsLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error('No valid token found for advanced analytics');
        setAnalyticsLoading(false);
        return;
      }

      console.log('Loading advanced analytics for range:', dateRange);
      const response = await fetch(`${API_BASE_URL}/it-dashboard/advanced-analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Advanced analytics response:', data);
        if (data.success && data.data) {
          console.log('Setting advanced analytics data:', data.data);
          setAdvancedAnalytics(data.data);
        } else {
          console.error('Advanced analytics response missing data:', data);
          setAdvancedAnalytics(null);
        }
      } else {
        const errorText = await response.text();
        console.error('Advanced analytics error:', response.status, errorText);
        setAdvancedAnalytics(null);
      }
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
      setAdvancedAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };


  // Export analytics data to CSV
  const exportAnalyticsData = (data, dateRange) => {
    const csvContent = [
      // Header
      ['PowerHub Analytics Report', `Date Range: ${dateRange}`],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['User Growth'],
      ['New Users', data.userGrowth?.newUsers || 0],
      ['Growth Percentage', `${data.userGrowth?.percentage || 0}%`],
      ['Total Users', data.userGrowth?.totalUsers || 0],
      [''],
      ['Content Engagement'],
      ['Average Rating', `${data.contentEngagement?.averageRating || 0}/5`],
      ['Total Interactions', data.contentEngagement?.totalInteractions || 0],
      ['Total Content', data.contentEngagement?.totalContent || 0],
      [''],
      ['System Performance'],
      ['Average Response Time', `${data.systemPerformance?.averageResponseTime || 0}ms`],
      ['Uptime', `${data.systemPerformance?.uptime || 0}%`],
      [''],
      ['Security'],
      ['Security Score', `${data.securityScore?.score || 0}/100`],
      ['Active Threats', data.securityScore?.threats || 0],
      [''],
      ['User Demographics'],
      ['Students', `${data.userDemographics?.students || 0}%`],
      ['Admins', `${data.userDemographics?.admins || 0}%`],
      ['IT Staff', `${data.userDemographics?.it || 0}%`],
      [''],
      ['Top Content'],
      ['Title', 'Views', 'Engagement Rate'],
      ...(data.topContent?.slice(0, 5).map(content => [
        content.title,
        content.views || 0,
        `${content.engagementRate || 0}%`
      ]) || [])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `powerhub-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        loadUsers(currentPage);
        alert('User role updated successfully');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/it-dashboard/users/${user._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          loadUsers(currentPage);
          alert('User deleted successfully');
        } else {
          const data = await response.json();
          alert(data.message || 'Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleToggleSuspension = async (user) => {
    const action = user.isSuspended ? 'unsuspend' : 'suspend';
    const reason = user.isSuspended ? '' : prompt('Enter suspension reason:');
    
    if (user.isSuspended || reason !== null) {
      try {
        const response = await fetch(`${API_BASE_URL}/it-dashboard/users/${user._id}/suspend`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            suspended: !user.isSuspended,
            reason: reason || ''
          })
        });
        
        if (response.ok) {
          loadUsers(currentPage);
          loadSuspendedUsers();
          loadAllUsersForStats();
          alert(`User ${action}ed successfully`);
        } else {
          const data = await response.json();
          alert(data.message || `Error ${action}ing user`);
        }
      } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        alert(`Error ${action}ing user`);
        }
      }
    };

  const handleEditUser = (user) => {
    // For now, we'll use simple prompts. You can enhance this with a modal later
    const firstName = prompt('First Name:', user.firstName);
    const lastName = prompt('Last Name:', user.lastName);
    const email = prompt('Email:', user.email);
    const username = prompt('Username:', user.username);
    
    if (firstName && lastName && email && username) {
      updateUserDetails(user._id, { firstName, lastName, email, username });
    }
  };

  const updateUserDetails = async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/it-dashboard/users/${userId}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        loadUsers(currentPage);
        alert('User updated successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadUsers(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
        <div className="flex items-center text-xs sm:text-sm text-gray-700">
          <span>
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
          </span>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: page === currentPage ? colors.primary : 'transparent'
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleTabChange = (tab) => {
    trackButtonClick(`it-dashboard-${tab}`, 'it-dashboard');
    setActiveTab(tab);
    switch (tab) {
      case 'flagged':
        loadFlaggedContent();
        break;
      case 'users':
        loadUsers();
        break;
      case 'security':
        loadSecurityOverview();
        loadSystemHealth();
        loadSecurityAlerts();
        loadRecentActivities();
        break;
      case 'audit':
        loadAuditLogs();
        break;
      case 'advanced-analytics':
        loadAdvancedAnalytics(analyticsDateRange);
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled by the AuthContext logout function
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - force navigation even if logout fails
      navigate('/');
    }
  };

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'System Overview', 
      icon: <MdAnalytics size={20} />
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: <MdDashboard size={20} />
    },
    { 
      id: 'advanced-analytics', 
      label: 'Advanced Analytics', 
      icon: <MdTrendingUp size={20} />
    },
    { 
      id: 'security', 
      label: 'System Health', 
      icon: <MdSecurity size={20} />,
      badge: (systemHealth?.security?.alerts?.active || 0) > 0 ? systemHealth.security.alerts.active : null,
      badgeColor: 'bg-red-500'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <MdPeople size={20} />
    },
    { 
      id: 'suspended-users', 
      label: 'Suspended Users', 
      icon: <MdBlock size={20} />,
      badge: suspendedUsersCount > 0 ? suspendedUsersCount : null,
      badgeColor: 'bg-red-500'
    },
    { 
      id: 'flagged', 
      label: 'Content Moderation', 
      icon: <MdFlag size={20} />,
      badge: flaggedContent.length > 0 ? flaggedContent.length : null,
      badgeColor: 'bg-yellow-500'
    },
    { 
      id: 'audit', 
      label: 'Audit Logs', 
      icon: <MdHistory size={20} />
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance Mode', 
      icon: <MdSettings size={20} />
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check analytics status
  const checkAnalyticsStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/detailed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const message = data.data.analyticsCount === 0 
          ? 'No analytics data yet. Use the platform (watch videos, like posts, navigate pages) to generate real analytics!'
          : `Real analytics data available: ${data.data.analyticsCount} records`;
        alert(message);
      }
    } catch (error) {
      console.error('Error checking analytics status:', error);
      alert('Error checking analytics status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <MdMenu size={24} />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">IT Dashboard</h1>
        </div>
        <div className="text-sm text-gray-500">
          {user?.firstName} {user?.lastName}
        </div>
      </div>

      <div className="flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${
          sidebarOpen ? 'w-64' : 'md:w-64 w-64'
        } bg-white shadow-lg md:transition-none transition-all duration-300 ease-in-out fixed z-50 h-screen overflow-y-auto`}>
         <div className="p-2 sm:p-4">
           {/* Header */}
           <div className="flex items-center justify-between mb-4">
             {sidebarOpen ? (
               <div className="flex items-center space-x-2">
                 <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: colors.primary }}>IT Dashboard</h1>
                 {autoRefreshEnabled && (
                   <div className="flex items-center space-x-1">
                     <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                     <span className="text-xs text-gray-500">Auto</span>
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <h1 className="text-lg font-bold text-center w-full" style={{ color: colors.primary }}>IT</h1>
                 {autoRefreshEnabled && (
                   <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                 )}
               </div>
             )}
             <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
             >
               {sidebarOpen ? <MdClose size={18} className="sm:w-5 sm:h-5" /> : <MdMenu size={18} className="sm:w-5 sm:h-5" />}
             </button>
           </div>

           {/* System Status Indicator */}
           {sidebarOpen && (
             <div className="mb-6 p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <div className={`w-3 h-3 rounded-full ${
                     systemHealth?.overall?.status === 'healthy' ? 'bg-green-500' :
                     systemHealth?.overall?.status === 'warning' ? 'bg-yellow-500' :
                     'bg-red-500'
                   }`}></div>
                   <span className="ml-2 text-sm font-medium text-gray-700">
                     System Status
                   </span>
                 </div>
                 <span className={`text-xs px-2 py-1 rounded ${
                   systemHealth?.overall?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                   systemHealth?.overall?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                   'bg-red-100 text-red-800'
                 }`}>
                   {systemHealth?.overall?.status?.toUpperCase() || 'UNKNOWN'}
                 </span>
               </div>
               {systemHealth?.overall?.message && (
                 <p className="text-xs text-gray-600 mt-2">{systemHealth.overall.message}</p>
               )}
               
               {/* Quick Stats */}
               <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                 <div className="text-center p-2 bg-white rounded">
                   <div className="font-semibold text-gray-900">
                     {systemHealth?.security?.alerts?.active || 0}
                   </div>
                   <div className="text-gray-500">Alerts</div>
                 </div>
                 <div className="text-center p-2 bg-white rounded">
                   <div className="font-semibold text-gray-900">
                     {systemHealth?.server?.uptime?.formatted || '0m'}
                   </div>
                   <div className="text-gray-500">Uptime</div>
                 </div>
               </div>
             </div>
           )}

                     {/* Navigation Items */}
           <nav className="space-y-2">
             {sidebarItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => handleTabChange(item.id)}
                 className={`w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                   activeTab === item.id
                     ? 'text-white'
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                 }`}
                 style={{
                   backgroundColor: activeTab === item.id ? colors.primary : 'transparent'
                 }}
                 title={!sidebarOpen ? item.label : ''}
               >
                 <div className="flex items-center min-w-0">
                   <span className="flex-shrink-0">{item.icon}</span>
                   {sidebarOpen && (
                     <div className="ml-2 sm:ml-3 min-w-0">
                       <div className="font-medium text-sm sm:text-base truncate">{item.label}</div>
                     </div>
                   )}
                 </div>
                 {sidebarOpen && item.badge && (
                   <span className={`${item.badgeColor || 'bg-red-500'} text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0`}>
                     {item.badge}
                   </span>
                 )}
               </button>
             ))}
           </nav>

                     {/* Logout Button */}
           <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200">
             <button
               onClick={handleLogout}
               className="w-full flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
               title={!sidebarOpen ? 'Logout' : ''}
             >
               <MdLogout size={18} className="sm:w-5 sm:h-5" />
               {sidebarOpen && <span className="ml-2 sm:ml-3 font-medium text-sm sm:text-base">Logout</span>}
             </button>
           </div>
        </div>
      </div>

                             {/* Main Content */}
         <div className="flex-1 md:ml-64">
           {/* Maintenance Mode Banner */}
           {maintenanceMode && (
             <div className="bg-yellow-50 border-b border-yellow-200 px-3 sm:px-6 py-3">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                 <div className="flex items-center">
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                   <span className="text-xs sm:text-sm font-medium text-yellow-800">
                     Maintenance Mode is currently active. Only IT users can access the platform.
                   </span>
                 </div>
                 <div className="flex items-center space-x-3">
                   <span className="text-xs text-yellow-600">
                     Regular users will see a maintenance page
                   </span>
                   <button
                     onClick={refreshMaintenanceStatus}
                     className="text-xs text-yellow-700 hover:text-yellow-800 underline"
                   >
                     Refresh Status
                   </button>
                 </div>
               </div>
             </div>
           )}
           
           {/* Header */}
           <div className="bg-white shadow-sm border-b">
           <div className="px-3 sm:px-6 py-4">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <div className="flex items-center">
                 <div>
                   <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.primary }}>IT Dashboard</h1>
                   <p className="text-sm sm:text-base text-gray-600">System administration and monitoring</p>
                 </div>
               </div>
               <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                 {/* Maintenance Mode Status */}
                 {maintenanceMode && (
                   <div className="flex items-center px-3 py-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                     <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.accent }}></div>
                     <span className="text-xs sm:text-sm font-medium" style={{ color: colors.accent }}>
                       Maintenance Mode Active
                     </span>
                   </div>
                 )}
                 <span className="text-xs sm:text-sm text-gray-500">
                   Logged in as: {user?.username} (Role: {user?.role})
                 </span>
                 
                 {/* Auto-refresh Controls */}
                 <div className="flex items-center space-x-2">
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                       className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                         autoRefreshEnabled 
                           ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                     >
                       {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                     </button>
                     
                     <button
                       onClick={() => refreshAllData(true)}
                       disabled={isRefreshing}
                       className="px-3 py-1 text-xs font-medium text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-1"
                       style={{ backgroundColor: colors.primary }}
                     >
                       {isRefreshing ? (
                         <>
                           <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           <span>Refreshing...</span>
                         </>
                       ) : (
                         <>
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           <span>Refresh</span>
                         </>
                       )}
                     </button>
                   </div>
                   
                   <div className="text-xs text-gray-500">
                     Last: {lastRefreshTime.toLocaleTimeString()}
                   </div>
                 </div>
                 
                 <button
                   onClick={() => navigate('/home')}
                   className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-md transition-colors w-full sm:w-auto"
                   style={{ backgroundColor: colors.secondary }}
                 >
                   Back to Platform
                 </button>
               </div>
             </div>
           </div>
         </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="px-3 sm:px-6 py-4 sm:py-8 max-w-full overflow-hidden">
                          {/* System Overview Tab */}
          {activeTab === 'overview' && systemOverview && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header with Refresh Button */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Overview</h2>
                <button
                  onClick={refreshAnalytics}
                  className="px-3 sm:px-4 py-2 text-sm text-white rounded-md transition-colors hover:opacity-90 w-full sm:w-auto"
                  style={{ backgroundColor: colors.primary }}
                >
                  Refresh Analytics
                </button>
              </div>
              
              {/* First Row - Basic Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Users Card */}
                <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                        <FormattedNumber 
                          value={systemOverview.totalUsers || 0} 
                          className="text-3xl font-bold text-blue-900"
                        />
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-blue-600 font-medium">+12%</span>
                    </div>
                  </div>
                </div>

                {/* Total Videos Card */}
                <div className="group relative bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">Total Videos</p>
                        <FormattedNumber 
                          value={systemOverview.totalVideos || 0} 
                          className="text-3xl font-bold text-red-900"
                        />
                      </div>
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 bg-red-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-red-600 font-medium">+8%</span>
                    </div>
                  </div>
                </div>

                {/* Total Posts Card */}
                <div className="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Total Posts</p>
                        <FormattedNumber 
                          value={systemOverview.totalPosts || 0} 
                          className="text-3xl font-bold text-green-900"
                        />
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 bg-green-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-green-600 font-medium">+5%</span>
                    </div>
                  </div>
                </div>

                {/* Active Users Card */}
                <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600 mb-1">Active Users (24h)</p>
                        <FormattedNumber 
                          value={systemOverview.activeUsers24h || 0} 
                          className="text-3xl font-bold text-yellow-900"
                        />
                      </div>
                      <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 bg-yellow-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-yellow-600 font-medium">+15%</span>
                    </div>
                  </div>
                </div>
             </div>

                           {/* Second Row - Analytics Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Clicks Card */}
                <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 mb-1">Total Clicks</p>
                        <FormattedNumber 
                          value={systemOverview.totalClicks || 0} 
                          className="text-3xl font-bold text-purple-900"
                        />
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5-7-7-3 3 5 5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-purple-600 font-medium">+18%</span>
                    </div>
                  </div>
                </div>

               <div className="bg-white overflow-hidden shadow rounded-lg border-l-4" style={{ borderLeftColor: '#06b6d4' }}>
                 <div className="p-5">
                   <div className="flex items-center">
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#06b6d4' }}>
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                       </div>
                     </div>
                     <div className="ml-5 w-0 flex-1">
                       <dl>
                         <dt className="text-sm font-medium text-gray-500 truncate">Total Watch Time</dt>
                         <dd className="text-lg font-medium text-gray-900">
                           {formatTime(systemOverview.totalWatchTime)}
                         </dd>
                       </dl>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-white overflow-hidden shadow rounded-lg border-l-4" style={{ borderLeftColor: '#10b981' }}>
                 <div className="p-5">
                   <div className="flex items-center">
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                         </svg>
                       </div>
                     </div>
                     <div className="ml-5 w-0 flex-1">
                       <dl>
                         <dt className="text-sm font-medium text-gray-500 truncate">Avg Watch/Day</dt>
                         <dd className="text-lg font-medium text-gray-900">
                           {systemOverview.averageWatchTimePerDay ? 
                             `${Math.floor(systemOverview.averageWatchTimePerDay / 60)}h ${systemOverview.averageWatchTimePerDay % 60}m` : 
                             '0h 0m'
                           }
                         </dd>
                       </dl>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-white overflow-hidden shadow rounded-lg border-l-4" style={{ borderLeftColor: '#f97316' }}>
                 <div className="p-5">
                   <div className="flex items-center">
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                       </div>
                     </div>
                     <div className="ml-5 w-0 flex-1">
                       <dl>
                         <dt className="text-sm font-medium text-gray-500 truncate">Avg Session</dt>
                         <dd className="text-lg font-medium text-gray-900">
                           <FormattedSessionDuration
                             value={systemOverview.averageSessionDuration || 0}
                             className="text-lg font-medium text-gray-900"
                           />
                         </dd>
                       </dl>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Average Time Per User Card */}
               <div className="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200">
                 <div className="p-6">
                   <div className="flex items-center">
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                       </div>
                     </div>
                     <div className="ml-5 w-0 flex-1">
                       <dl>
                         <dt className="text-sm font-medium text-gray-500 truncate">Avg Time Per User</dt>
                         <dd className="text-lg font-medium text-gray-900">
                           <FormattedSessionDuration
                             value={systemOverview.averageTimePerUser || 0}
                             className="text-lg font-medium text-gray-900"
                           />
                         </dd>
                       </dl>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
                   )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && systemOverview && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Engagement Analytics</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={loadOverview}
                      className="px-3 py-1 text-sm text-white rounded-md transition-colors"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Refresh Data
                    </button>
                                         <button
                       onClick={checkAnalyticsStatus}
                       className="px-3 py-1 text-sm text-white rounded-md transition-colors"
                       style={{ backgroundColor: colors.secondary }}
                     >
                       Check Analytics Status
                     </button>
                  </div>
                </div>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Click Analytics Chart */}
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Click Analytics</h4>
                    <div className="h-48 sm:h-64">
                      <Line
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          datasets: [
                            {
                              label: 'Total Clicks',
                              data: [
                                systemOverview.totalClicks || 0,
                                (systemOverview.totalClicks || 0) * 0.8,
                                (systemOverview.totalClicks || 0) * 1.2,
                                (systemOverview.totalClicks || 0) * 0.9
                              ],
                              borderColor: 'rgba(59, 130, 246, 1)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                            {
                              label: 'Clicks per User',
                              data: [
                                systemOverview.totalUsers ? Math.round(systemOverview.totalClicks / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers ? Math.round((systemOverview.totalClicks * 0.8) / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers ? Math.round((systemOverview.totalClicks * 1.2) / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers ? Math.round((systemOverview.totalClicks * 0.9) / systemOverview.totalUsers) : 0
                              ],
                              borderColor: 'rgba(16, 185, 129, 1)',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                padding: 20
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  if (context.datasetIndex === 0) {
                                    return `Total Clicks: ${context.parsed.y.toLocaleString()}`;
                                  } else {
                                    return `Clicks per User: ${context.parsed.y}`;
                                  }
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          <FormattedNumber 
                            value={systemOverview.totalClicks || 0} 
                            className=""
                          />
                        </div>
                        <div className="text-sm text-gray-500">Total Clicks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {systemOverview.totalUsers ? Math.round(systemOverview.totalClicks / systemOverview.totalUsers) : '0'}
                        </div>
                        <div className="text-sm text-gray-500">Per User</div>
                      </div>
                    </div>
                  </div>

                  {/* Watch Time Analytics Chart */}
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Watch Time Analytics</h4>
                    <div className="h-48 sm:h-64">
                      <Line
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          datasets: [
                            {
                              label: 'Total Watch Time',
                              data: [
                                systemOverview.totalWatchTime || 0,
                                (systemOverview.totalWatchTime || 0) * 0.9,
                                (systemOverview.totalWatchTime || 0) * 1.1,
                                (systemOverview.totalWatchTime || 0) * 0.85
                              ],
                              borderColor: 'rgba(147, 51, 234, 1)',
                              backgroundColor: 'rgba(147, 51, 234, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                            {
                              label: 'Avg per User',
                              data: [
                                systemOverview.totalUsers && systemOverview.totalWatchTime ? 
                                  Math.round(systemOverview.totalWatchTime / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers && systemOverview.totalWatchTime ? 
                                  Math.round((systemOverview.totalWatchTime * 0.9) / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers && systemOverview.totalWatchTime ? 
                                  Math.round((systemOverview.totalWatchTime * 1.1) / systemOverview.totalUsers) : 0,
                                systemOverview.totalUsers && systemOverview.totalWatchTime ? 
                                  Math.round((systemOverview.totalWatchTime * 0.85) / systemOverview.totalUsers) : 0
                              ],
                              borderColor: 'rgba(245, 158, 11, 1)',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                padding: 20
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const minutes = context.parsed.y;
                                  const hours = Math.floor(minutes / 60);
                                  const mins = minutes % 60;
                                  return `${context.dataset.label}: ${hours}h ${mins}m`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                              },
                              ticks: {
                                callback: function(value) {
                                  const hours = Math.floor(value / 60);
                                  const mins = value % 60;
                                  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {systemOverview.totalWatchTime ? 
                            `${Math.floor(systemOverview.totalWatchTime / 60)}h ${systemOverview.totalWatchTime % 60}m` : 
                            '0h 0m'
                          }
                        </div>
                        <div className="text-sm text-gray-500">Total Watch Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {systemOverview.totalUsers && systemOverview.totalWatchTime ? 
                            `${Math.floor((systemOverview.totalWatchTime / systemOverview.totalUsers) / 60)}h ${Math.round((systemOverview.totalWatchTime / systemOverview.totalUsers) % 60)}m` : 
                            '0h 0m'
                          }
                        </div>
                        <div className="text-sm text-gray-500">Avg per User</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Performance Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Averages Chart */}
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Daily Averages</h4>
                    <div className="h-48 sm:h-64">
                      <Line
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          datasets: [
                            {
                              label: 'Watch Time/Day',
                              data: [
                                systemOverview.averageWatchTimePerDay || 0,
                                (systemOverview.averageWatchTimePerDay || 0) * 1.1,
                                (systemOverview.averageWatchTimePerDay || 0) * 0.9,
                                (systemOverview.averageWatchTimePerDay || 0) * 1.05
                              ],
                              borderColor: 'rgba(239, 68, 68, 1)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                            {
                              label: 'Session Duration',
                              data: [
                                systemOverview.averageSessionDuration || 0,
                                (systemOverview.averageSessionDuration || 0) * 0.8,
                                (systemOverview.averageSessionDuration || 0) * 1.2,
                                (systemOverview.averageSessionDuration || 0) * 0.95
                              ],
                              borderColor: 'rgba(99, 102, 241, 1)',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              tension: 0.1,
                              fill: true,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                padding: 20
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  if (context.datasetIndex === 0) {
                                    const minutes = context.parsed.y;
                                    const hours = Math.floor(minutes / 60);
                                    const mins = minutes % 60;
                                    return `${context.dataset.label}: ${hours}h ${mins}m`;
                                  } else {
                                    return `${context.dataset.label}: ${context.parsed.y}m`;
                                  }
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {systemOverview.averageWatchTimePerDay ? 
                            `${Math.floor(systemOverview.averageWatchTimePerDay / 60)}h ${systemOverview.averageWatchTimePerDay % 60}m` : 
                            '0h 0m'
                          }
                        </div>
                        <div className="text-sm text-gray-500">Watch Time/Day</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          <FormattedSessionDuration
                            value={systemOverview.averageSessionDuration || 0}
                            className="text-2xl font-bold text-red-600"
                          />
                        </div>
                        <div className="text-sm text-gray-500">Session Duration</div>
                      </div>
                    </div>
                  </div>

                  {/* User Activity Chart */}
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">User Activity</h4>
                    <div className="h-48 sm:h-64">
                      <Doughnut
                        data={{
                          labels: ['Active Users', 'Inactive Users'],
                          datasets: [
                            {
                              data: [
                                systemOverview.activeUsers24h || 0,
                                (systemOverview.totalUsers || 0) - (systemOverview.activeUsers24h || 0)
                              ],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(156, 163, 175, 0.8)'
                              ],
                              borderColor: [
                                'rgb(34, 197, 94)',
                                'rgb(156, 163, 175)'
                              ],
                              borderWidth: 2
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 20,
                                usePointStyle: true
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((context.parsed / total) * 100);
                                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          <FormattedNumber 
                            value={systemOverview.activeUsers24h || 0} 
                            className=""
                          />
                        </div>
                        <div className="text-sm text-gray-500">Active Users (24h)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {systemOverview.totalUsers ? 
                            `${Math.round((systemOverview.activeUsers24h / systemOverview.totalUsers) * 100)}%` : 
                            '0%'
                          }
                        </div>
                        <div className="text-sm text-gray-500">Activity Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'advanced-analytics' && (
            <div className="space-y-6">
              {/* Header with Date Range Selector */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
                      {analyticsLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {/* Date Range Selector */}
                    <select
                      value={analyticsDateRange}
                      onChange={(e) => {
                        setAnalyticsDateRange(e.target.value);
                        loadAdvancedAnalytics(e.target.value);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                    </select>
                    <button
                      onClick={() => loadAdvancedAnalytics(analyticsDateRange)}
                      disabled={analyticsLoading}
                      className="px-4 py-2 text-sm text-white rounded-md transition-colors disabled:opacity-50"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {analyticsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                    {advancedAnalytics && (
                      <button
                        onClick={() => exportAnalyticsData(advancedAnalytics, analyticsDateRange)}
                        className="px-4 py-2 text-sm text-white rounded-md transition-colors"
                        style={{ backgroundColor: colors.secondary || '#10b981' }}
                      >
                        Export CSV
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {advancedAnalytics ? (
                <>
                  {/* Key Performance Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <MdTrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                User Growth
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                +{advancedAnalytics.userGrowth?.percentage || 0}%
                              </dd>
                              <dd className="text-sm text-gray-500">
                                {advancedAnalytics.userGrowth?.newUsers || 0} new users
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <MdBarChart className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Content Engagement
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {advancedAnalytics.contentEngagement?.averageRating || 0}/5
                              </dd>
                              <dd className="text-sm text-gray-500">
                                {advancedAnalytics.contentEngagement?.totalInteractions || 0} interactions
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <MdAnalytics className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                System Performance
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {advancedAnalytics.systemPerformance?.averageResponseTime || 0}ms
                              </dd>
                              <dd className="text-sm text-gray-500">
                                {advancedAnalytics.systemPerformance?.uptime || 99}% uptime
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <MdSecurity className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Security Score
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {advancedAnalytics.securityScore?.score || 95}/100
                              </dd>
                              <dd className="text-sm text-gray-500">
                                {advancedAnalytics.securityScore?.threats || 0} threats blocked
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* User Activity Chart */}
                    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">User Activity Trends</h4>
                      <div className="h-48 sm:h-64">
                        <Bar
                          data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [
                              {
                                label: 'Daily Login Activity',
                                data: advancedAnalytics.dailyActivity || [0, 0, 0, 0, 0, 0, 0],
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      </div>
                      <div className="mt-4 text-sm text-gray-500 text-center">
                        Peak hours: {advancedAnalytics.userActivity?.peakHours || 'N/A'}
                      </div>
                    </div>

                    {/* Content Performance Chart */}
                    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Content Performance</h4>
                      <div className="h-48 sm:h-64">
                        <Line
                          data={{
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                            datasets: [
                              {
                                label: 'Views',
                                data: advancedAnalytics.weeklyViews || [0, 0, 0, 0],
                                borderColor: 'rgba(34, 197, 94, 1)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.1,
                                fill: true,
                              },
                              {
                                label: 'Engagement',
                                data: advancedAnalytics.weeklyInteractions || [0, 0, 0, 0],
                                borderColor: 'rgba(168, 85, 247, 1)',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                tension: 0.1,
                                fill: true,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div className="text-center">
                          <span className="font-medium">Category:</span> {advancedAnalytics.contentPerformance?.topCategory || 'N/A'}
                        </div>
                        <div className="text-center">
                          <span className="font-medium">Avg. Watch Time:</span> {advancedAnalytics.contentPerformance?.averageWatchTime || 0}min
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Top Content Chart */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900">Top Performing Content</h4>
                      </div>
                      <div className="p-4 sm:p-6">
                        {advancedAnalytics.topContent?.length > 0 ? (
                          <div className="h-64 sm:h-80">
                            <Bar
                              data={{
                                labels: advancedAnalytics.topContent.slice(0, 5).map(content => 
                                  content.title.length > 25 ? content.title.substring(0, 25) + '...' : content.title
                                ),
                                datasets: [
                                  {
                                    label: 'Views',
                                    data: advancedAnalytics.topContent.slice(0, 5).map(content => content.views || 0),
                                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                    borderColor: 'rgba(59, 130, 246, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'y',
                                  },
                                  {
                                    label: 'Engagement Rate (%)',
                                    data: advancedAnalytics.topContent.slice(0, 5).map(content => content.engagementRate || 0),
                                    backgroundColor: 'rgba(168, 85, 247, 0.6)',
                                    borderColor: 'rgba(168, 85, 247, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'y1',
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                  mode: 'index',
                                  intersect: false,
                                },
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  tooltip: {
                                    callbacks: {
                                      title: function(context) {
                                        const index = context[0].dataIndex;
                                        return advancedAnalytics.topContent[index]?.title || '';
                                      },
                                      label: function(context) {
                                        const label = context.dataset.label || '';
                                        const value = context.parsed.y;
                                        if (label.includes('Rate')) {
                                          return `${label}: ${value}%`;
                                        }
                                        return `${label}: ${value.toLocaleString()}`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  x: {
                                    title: {
                                      display: true,
                                      text: 'Content Title'
                                    }
                                  },
                                  y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: {
                                      display: true,
                                      text: 'Views'
                                    },
                                  },
                                  y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    title: {
                                      display: true,
                                      text: 'Engagement Rate (%)'
                                    },
                                    grid: {
                                      drawOnChartArea: false,
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <MdBarChart className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2">No content data available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Demographics */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900">User Demographics</h4>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="h-48 sm:h-64 flex items-center justify-center">
                          <Doughnut
                            data={{
                              labels: ['Students', 'Admins', 'IT Staff'],
                              datasets: [
                                {
                                  data: [
                                    advancedAnalytics.userDemographics?.students || 0,
                                    advancedAnalytics.userDemographics?.admins || 0,
                                    advancedAnalytics.userDemographics?.it || 0,
                                  ],
                                  backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(168, 85, 247, 0.8)',
                                  ],
                                  borderColor: [
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(168, 85, 247, 1)',
                                  ],
                                  borderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                },
                                title: {
                                  display: false,
                                },
                              },
                            }}
                          />
                        </div>
                        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-center">
                          <div>
                            <div className="font-medium text-blue-600">Students</div>
                            <div className="text-gray-500">{advancedAnalytics.userDemographics?.students || 0}%</div>
                          </div>
                          <div>
                            <div className="font-medium text-green-600">Admins</div>
                            <div className="text-gray-500">{advancedAnalytics.userDemographics?.admins || 0}%</div>
                          </div>
                          <div>
                            <div className="font-medium text-purple-600">IT Staff</div>
                            <div className="text-gray-500">{advancedAnalytics.userDemographics?.it || 0}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white shadow rounded-lg p-12">
                  <div className="text-center">
                    {analyticsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">Loading Analytics...</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Fetching comprehensive insights and performance metrics
                        </p>
                      </>
                    ) : (
                      <>
                    <MdAnalytics className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Analytics Data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Advanced analytics data is not available yet. Click refresh to load data.
                    </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suspended Users Tab */}
        {activeTab === 'suspended-users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Suspended Users</h2>
                  <p className="text-red-100">Manage suspended user accounts and restore access</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={loadSuspendedUsers}
                    className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Suspended</p>
                    <p className="text-2xl font-bold text-gray-900">{suspendedUsersCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suspended Users List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Suspended Users</h3>
                <p className="text-sm text-gray-500 mt-1">Users who have been suspended from the platform</p>
              </div>

              {suspendedUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Suspended Users</h3>
                  <p className="text-gray-500">All users are currently active and have access to the platform.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {/* Mobile Cards View */}
                  <div className="block md:hidden">
                    {suspendedUsers.map((user) => (
                      <div key={user._id} className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              className="w-12 h-12 rounded-full object-cover"
                              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ef4444&color=fff`}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                              </div>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Suspended
                              </span>
                            </div>
                            {user.suspensionReason && (
                              <p className="text-xs text-gray-500 mt-1">Reason: {user.suspensionReason}</p>
                            )}
                            {user.suspendedAt && (
                              <p className="text-xs text-gray-500">Suspended: {new Date(user.suspendedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleToggleSuspension(user)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Unsuspend
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suspended</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {suspendedUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ef4444&color=fff`}
                                    alt={`${user.firstName} ${user.lastName}`}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.suspendedAt ? new Date(user.suspendedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {user.suspensionReason || 'No reason provided'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleToggleSuspension(user)}
                                className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Unsuspend
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Mode Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Maintenance Mode</h3>
                  <p className="text-gray-600">Control system maintenance and user access</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    maintenanceMode 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      maintenanceMode ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    {maintenanceMode ? 'Maintenance Active' : 'System Normal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">Current Status</h4>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Overview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">System Status</h5>
                        <p className="text-xs text-gray-500 mt-1">Current maintenance state</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        maintenanceMode 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {maintenanceMode ? 'Maintenance Mode' : 'Normal Operation'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">User Access</h5>
                        <p className="text-xs text-gray-500 mt-1">Who can access the platform</p>
                      </div>
                      <div className="text-sm text-gray-700">
                        {maintenanceMode ? 'IT & Admin Only' : 'All Users'}
                      </div>
                    </div>
                  </div>

                  {/* Impact Information */}
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h5 className="text-sm font-medium text-blue-900">Impact</h5>
                          <p className="text-xs text-blue-700 mt-1">
                            {maintenanceMode 
                              ? 'Only IT and Admin users can log in. Students cannot access the platform'
                              : 'All users have normal access to the platform'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h5 className="text-sm font-medium text-yellow-900">Recommendation</h5>
                          <p className="text-xs text-yellow-700 mt-1">
                            {maintenanceMode 
                              ? 'Use maintenance mode only during system updates or critical maintenance'
                              : 'Enable maintenance mode when performing system updates or maintenance'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Message Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">Maintenance Message</h4>
                <p className="text-sm text-gray-600 mt-1">Customize the message shown to users during maintenance</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Content
                    </label>
                    <textarea
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                      rows={4}
                      placeholder="Enter a custom maintenance message that will be displayed to users..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This message will be shown to regular users when maintenance mode is active.
                    </p>
                  </div>
                  
                  {/* Message Preview */}
                  {maintenanceMessage && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">Maintenance Notice</span>
                        </div>
                        <p className="text-sm text-gray-700">{maintenanceMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">Control Actions</h4>
                <p className="text-sm text-gray-600 mt-1">Enable or disable maintenance mode</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      {maintenanceMode 
                        ? 'Return the system to normal operation and allow all users to access the platform'
                        : 'Put the system in maintenance mode and restrict access to IT and Admin users only'
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={refreshMaintenanceStatus}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Status
                    </button>
                    <button
                      onClick={toggleMaintenanceMode}
                      className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                        maintenanceMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {maintenanceMode ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Disable Maintenance
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Enable Maintenance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Moderation Tab */}
        {activeTab === 'flagged' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Content Moderation</h3>
                  <p className="text-gray-600">Review and manage flagged content reports</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <FormattedNumber 
                      value={flaggedContent.length} 
                      className="text-2xl font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <FormattedNumber 
                      value={flaggedContent.filter(c => c.status === 'pending').length} 
                      className="text-2xl font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reviewed</p>
                    <FormattedNumber 
                      value={flaggedContent.filter(c => c.status === 'reviewed').length} 
                      className="text-2xl font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <FormattedNumber 
                      value={flaggedContent.filter(c => c.status === 'resolved').length} 
                      className="text-2xl font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flagged Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Flagged Content Reports</h4>
                  <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Cards View */}
              <div className="block md:hidden">
                <div className="p-4 space-y-4">
                  {flaggedContent.map((content) => (
                    <div key={content._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{content.contentType}</h5>
                          <p className="text-xs text-gray-500 mt-1">ID: {content.contentId}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          content.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          content.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          content.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {content.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Reported by:</span>
                          <span className="text-xs text-gray-900">@{content.reportedBy?.username}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-medium text-gray-600">Reason:</span>
                          <span className="text-xs text-gray-900 text-right max-w-48">{content.reason}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReviewModal(content)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => reviewFlaggedContent(content._id, 'resolved', 'remove', 'Content removed by IT - violation confirmed')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Quick Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {flaggedContent.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No flagged content</p>
                      <p className="text-sm">Content reports will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flaggedContent.map((content) => (
                      <tr key={content._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{content.contentType}</div>
                              <div className="text-sm text-gray-500">ID: {content.contentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">@{content.reportedBy?.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{content.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            content.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            content.status === 'reviewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            content.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            <svg className="w-3 h-3 mr-1 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              {content.status === 'pending' && (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              )}
                              {content.status === 'reviewed' && (
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              )}
                              {content.status === 'resolved' && (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              )}
                            </svg>
                            {content.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openReviewModal(content)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Review
                            </button>
                            <button
                              onClick={() => reviewFlaggedContent(content._id, 'resolved', 'remove', 'Content removed by IT - violation confirmed')}
                              className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {flaggedContent.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No flagged content</p>
                            <p className="text-sm">Content reports will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

                          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{allUsers.filter(u => !u.isSuspended).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Suspended Users</p>
                      <p className="text-2xl font-bold text-gray-900">{allUsers.filter(u => u.isSuspended).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Admin Users</p>
                      <p className="text-2xl font-bold text-gray-900">{allUsers.filter(u => u.role === 'admin' || u.role === 'IT').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                    <h4 className="text-lg font-semibold text-gray-900">All Users</h4>
                      {userSearchTerm && (
                        <p className="text-sm text-gray-500 mt-1">
                          {isSearching ? 'Searching...' : `Found ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} matching "${userSearchTerm}"`}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {isSearching ? (
                          <div className="absolute left-3 top-2.5 h-4 w-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                        <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Cards View */}
                <div className="block md:hidden">
                  <div className="p-4 space-y-4">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">
                          {userSearchTerm ? `No users match "${userSearchTerm}"` : 'No users available'}
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                      <div key={user._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profilePicture || 'https://via.placeholder.com/40'}
                              alt=""
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                          {user.isSuspended ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Email:</span> {user.email}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Role:</span>
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                              <option value="IT">IT</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleSuspension(user)}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                              user.isSuspended 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">
                              {userSearchTerm ? `No users match "${userSearchTerm}"` : 'No users available'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-full border-2 border-gray-200"
                                  src={user.profilePicture || 'https://via.placeholder.com/48'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white px-3 py-2"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                              <option value="IT">IT</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isSuspended ? (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                <svg className="w-3 h-3 mr-1 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                <svg className="w-3 h-3 mr-1 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleSuspension(user)}
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                  user.isSuspended 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                              >
                                {user.isSuspended ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Unsuspend
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Suspend
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                      )}
                  </tbody>
                </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && renderPagination()}
              </div>
            </div>
          )}

        {/* System Health Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Overall Health Status */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">System Health Status</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {healthLoading ? (
                    <div className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
                      LOADING...
                    </div>
                  ) : systemHealth ? (
                    <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      systemHealth.overall?.status === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : systemHealth.overall?.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {systemHealth.overall?.status?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                      ERROR
                    </div>
                  )}
                  <button
                    onClick={() => {
                      loadSystemHealth();
                      loadSecurityAlerts();
                      loadRecentActivities();
                    }}
                    className="px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {healthLoading ? (
                <p className="text-gray-600">Loading system health information...</p>
              ) : systemHealth ? (
                <p className="text-gray-600">{systemHealth.overall?.message || 'System health check completed'}</p>
              ) : (
                <p className="text-red-600">Failed to load system health. Click refresh to try again.</p>
              )}
            </div>

            {/* Health Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Server Health */}
              {systemHealth?.server && (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      systemHealth.server.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Server</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Uptime: {systemHealth.server.uptime?.formatted}</p>
                      <p className="text-xs text-gray-400">Memory: {systemHealth.server.memory?.usage}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Health */}
              {systemHealth?.database && (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      systemHealth.database.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Database</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{systemHealth.database.connectionState}</p>
                      {systemHealth.database.stats && (
                        <p className="text-xs text-gray-400">
                          {systemHealth.database.stats.collections} collections
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Health */}
              {systemHealth?.security && (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      systemHealth.security.status === 'healthy' ? 'bg-green-500' : 
                      systemHealth.security.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Security</h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {systemHealth.security.alerts?.active || 0} active alerts
                      </p>
                      <p className="text-xs text-gray-400">
                        {systemHealth.security.users?.locked || 0} locked accounts
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance */}
              {systemHealth?.performance && (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Performance</h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {systemHealth.performance.database?.activityRate || 0}% activity rate
                      </p>
                      <p className="text-xs text-gray-400">
                        {systemHealth.performance.activity?.recentLogins || 0} recent logins
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Security Events */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
              </div>
              
              {/* Mobile Cards View */}
              <div className="block md:hidden">
                <div className="p-4 space-y-4">
                  {securityAlerts.length > 0 ? securityAlerts.map((alert) => (
                    <div key={alert._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{alert.title}</h5>
                          <p className="text-xs text-gray-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type?.replace('_', ' ').toUpperCase() || 'SECURITY_ALERT'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">User:</span>
                          <span className="text-xs text-gray-900">{alert.userId?.email || alert.userId?.username || 'System'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">IP:</span>
                          <span className="text-xs text-gray-900">{alert.ipAddress || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Device:</span>
                          <span className="text-xs text-gray-900">
                            {alert.userAgent ? 
                              (alert.userAgent.includes('Chrome') ? 'Chrome' :
                               alert.userAgent.includes('Firefox') ? 'Firefox' :
                               alert.userAgent.includes('Safari') ? 'Safari' :
                               alert.userAgent.includes('Edge') ? 'Edge' : 'Unknown Browser')
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="pt-2">
                          <span className="text-xs font-medium text-gray-600">Description:</span>
                          <p className="text-xs text-gray-900 mt-1">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No recent security events</p>
                      <p className="text-sm">Security events will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                {securityAlerts.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {securityAlerts.map((alert) => (
                        <tr key={alert._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(alert.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {alert.userId?.email || alert.userId?.username || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.type?.replace('_', ' ').toUpperCase() || 'SECURITY_ALERT'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {alert.ipAddress || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {alert.userAgent ? 
                              (alert.userAgent.includes('Chrome') ? 'Chrome' :
                               alert.userAgent.includes('Firefox') ? 'Firefox' :
                               alert.userAgent.includes('Safari') ? 'Safari' :
                               alert.userAgent.includes('Edge') ? 'Edge' : 'Unknown Browser')
                              : 'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={alert.description}>
                              {alert.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={alert.description}>
                              {alert.description}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">No recent security events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-4 sm:p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity._id} className="flex items-start space-x-3 py-2">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.category === 'security' ? 'bg-red-500' :
                          activity.category === 'user_management' ? 'bg-blue-500' :
                          activity.category === 'content_moderation' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 break-words">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            by {activity.performedBy?.username || 'System'} • {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">No recent activities</p>
                    <p className="text-sm">System activities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
              <p className="text-sm text-gray-600 mt-1">Complete record of all system actions and changes</p>
            </div>
            
            {/* Mobile Cards View */}
            <div className="block md:hidden">
              {auditLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading audit logs...</span>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {auditLogs.length > 0 ? auditLogs.map((log) => (
                    <div key={log._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{log.action}</h5>
                          <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">User:</span>
                          <span className="text-xs text-gray-900">
                            {log.performedBy?.firstName} {log.performedBy?.lastName} (@{log.performedBy?.username})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Target:</span>
                          <span className="text-xs text-gray-900">{log.targetType}</span>
                        </div>
                        {log.targetName && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Name:</span>
                            <span className="text-xs text-gray-900">{log.targetName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Category:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.category === 'security' ? 'bg-red-100 text-red-800' :
                            log.category === 'user_management' ? 'bg-blue-100 text-blue-800' :
                            log.category === 'content_moderation' ? 'bg-yellow-100 text-yellow-800' :
                            log.category === 'authentication' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Time:</span>
                          <span className="text-xs text-gray-900">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No audit logs found</p>
                      <p className="text-sm">System activities will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              {auditLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading audit logs...</span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.length > 0 ? auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {log.performedBy?.firstName} {log.performedBy?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">@{log.performedBy?.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.targetType}</div>
                          {log.targetName && (
                            <div className="text-sm text-gray-500">{log.targetName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.category === 'security' ? 'bg-red-100 text-red-800' :
                            log.category === 'user_management' ? 'bg-blue-100 text-blue-800' :
                            log.category === 'content_moderation' ? 'bg-yellow-100 text-yellow-800' :
                            log.category === 'authentication' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No audit logs found</p>
                            <p className="text-sm">System activities will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Audit Logs Pagination */}
            {auditTotalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {((auditCurrentPage - 1) * auditLogsPerPage) + 1} to {Math.min(auditCurrentPage * auditLogsPerPage, auditTotalLogs)} of {auditTotalLogs} results
                  </div>
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => {
                        const newPage = auditCurrentPage - 1;
                        setAuditCurrentPage(newPage);
                        loadAuditLogs(newPage);
                      }}
                      disabled={auditCurrentPage === 1 || auditLoading}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                        auditCurrentPage === 1 || auditLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers - Show fewer on mobile */}
                    {Array.from({ length: Math.min(5, auditTotalPages) }, (_, i) => {
                      let pageNum;
                      if (auditTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (auditCurrentPage <= 3) {
                        pageNum = i + 1;
                      } else if (auditCurrentPage >= auditTotalPages - 2) {
                        pageNum = auditTotalPages - 4 + i;
                      } else {
                        pageNum = auditCurrentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setAuditCurrentPage(pageNum);
                            loadAuditLogs(pageNum);
                          }}
                          disabled={auditLoading}
                          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                            pageNum === auditCurrentPage
                              ? 'bg-blue-600 text-white'
                              : auditLoading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => {
                        const newPage = auditCurrentPage + 1;
                        setAuditCurrentPage(newPage);
                        loadAuditLogs(newPage);
                      }}
                      disabled={auditCurrentPage === auditTotalPages || auditLoading}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                        auditCurrentPage === auditTotalPages || auditLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
      
      {/* Review Content Modal */}
      <ReviewContentModal
        isOpen={reviewModalOpen}
        onClose={closeReviewModal}
        content={selectedContent}
        onReview={reviewFlaggedContent}
      />
    </div>
  );
};

export default ITDashboard;

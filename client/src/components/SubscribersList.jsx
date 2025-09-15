import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Search, Filter, TrendingUp, Calendar, Users, Sparkles, Crown, Target, Mail, User, Clock, ExternalLink, MessageCircle } from 'lucide-react';
import { fetchChannelSubscribers } from '../services/subscriptionApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ProfilePictureZoomModal from './ProfilePictureZoomModal';

const SubscribersList = () => {
  const navigate = useNavigate();
  
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [channelName, setChannelName] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    growthRate: 0
  });
  
  // Modal state for profile picture zoom
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    profilePicture: '',
    channelName: '',
    socialLinks: {},
    authorId: '',
    hasChannel: false
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    filterAndSortSubscribers();
  }, [subscribers, searchTerm, sortBy]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the current user's channel
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required to view subscribers');
        return;
      }

      const channelResponse = await fetch('http://localhost:5000/api/channel/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!channelResponse.ok) {
        throw new Error('Could not fetch your channel information');
      }

      const channel = await channelResponse.json();
      
      // Now fetch the subscribers for this channel
      const data = await fetchChannelSubscribers(channel._id);
      setSubscribers(data.subscribers);
      setChannelName(data.channelName);
      
      // Calculate stats from the subscribers data
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthCount = data.subscribers.filter(sub => 
        new Date(sub.subscribedAt || sub.joinedAt) >= thisMonth
      ).length;
      
      setStats({
        total: data.subscribers.length,
        thisMonth: thisMonthCount,
        growthRate: data.subscribers.length > 0 ? (thisMonthCount / data.subscribers.length) * 100 : 0
      });
    } catch (err) {
      setError(err.message || 'Failed to load subscribers. Please try again.');
      console.error('Error loading subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubscribers = () => {
    let filtered = subscribers.filter(subscriber =>
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subscriber.username && subscriber.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subscriber.email && subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subscriber.firstName && subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subscriber.lastName && subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || a.username || '').localeCompare(b.name || b.username || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'recent':
          return new Date(b.subscribedAt || b.joinedAt || 0) - new Date(a.subscribedAt || a.joinedAt || 0);
        case 'oldest':
          return new Date(a.subscribedAt || a.joinedAt || 0) - new Date(b.subscribedAt || b.joinedAt || 0);
        default:
          return 0;
      }
    });

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  };

  const handleProfilePictureClick = async (subscriber) => {
    const authorId = subscriber.id || subscriber._id;
    let hasChannel = false;
    let channelName = subscriber.name || subscriber.username || 'Unknown';
    let socialLinks = {};
    
    if (authorId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/channel/by-owner/${authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            hasChannel = true;
            channelName = data.name || channelName;
          }
          if (data.contactInfo) {
            socialLinks = data.contactInfo;
          }
        }
      } catch (err) {
        console.error('Error fetching channel:', err);
      }
    }
    
    setModalData({
      profilePicture: subscriber.profilePicture || subscriber.avatar || '/default-avatar.png',
      channelName,
      socialLinks,
      authorId,
      hasChannel
    });
    setModalOpen(true);
  };

  const handleViewChannel = async () => {
    setModalOpen(false);
    if (modalData.authorId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/channel/by-owner/${modalData.authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            navigate(`/channel/${data._id}`);
            return;
          }
        }
      } catch (err) {
        console.error('Error finding channel:', err);
      }
    }
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadSubscribers} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {channelName ? `${channelName}'s Subscribers` : 'Your Subscribers'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and view your channel subscribers
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.growthRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="recent">Recently subscribed</option>
              <option value="oldest">Oldest subscribers</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Share your channel to start gaining subscribers'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {currentItems.map((subscriber, index) => (
              <div
                key={subscriber.id || subscriber._id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                  index !== currentItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Profile Picture */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => handleProfilePictureClick(subscriber)}
                    >
                      <img
                        src={subscriber.profilePicture || subscriber.avatar || '/api/placeholder/60/60'}
                        alt={subscriber.name || subscriber.username}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>

                    {/* Subscriber Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {subscriber.name || `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() || subscriber.username || 'Unknown User'}
                        </h3>
                        {subscriber.username && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            @{subscriber.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {subscriber.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{subscriber.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Subscribed {formatRelativeDate(subscriber.subscribedAt || subscriber.joinedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleProfilePictureClick(subscriber)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${subscriber.email}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 bg-gray-50 hover:bg-green-50 dark:bg-gray-700 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Send email"
                      disabled={!subscriber.email}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Profile picture zoom modal */}
      {modalOpen && (
        <ProfilePictureZoomModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profilePicture={modalData.profilePicture}
          channelName={modalData.channelName}
          socialLinks={modalData.socialLinks}
          hasChannel={modalData.hasChannel}
          onViewChannel={handleViewChannel}
        />
      )}
    </div>
  );
};

export default SubscribersList;

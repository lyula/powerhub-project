import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, TrendingUp, Calendar, Sparkles, Bell, BellOff, Trash2, ExternalLink, User, Crown } from 'lucide-react';
import { fetchUserSubscriptions, toggleSubscription, updateNotificationSettings } from '../services/subscriptionApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const SubscriptionsList = () => {
  const navigate = useNavigate();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterAndSortSubscriptions();
  }, [subscriptions, searchTerm, sortBy]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.');
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubscriptions = () => {
    let filtered = subscriptions.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (channel.description && channel.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (channel.owner && (channel.owner.username || channel.owner.firstName || channel.owner.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscribers':
          return b.subscriberCount - a.subscriberCount;
        case 'recent':
          return new Date(b.subscribedAt) - new Date(a.subscribedAt);
        case 'oldest':
          return new Date(a.subscribedAt) - new Date(b.subscribedAt);
        default:
          return 0;
      }
    });

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  const handleUnsubscribe = async (channelId) => {
    if (!confirm('Are you sure you want to unsubscribe from this channel?')) {
      return;
    }
    
    try {
      await toggleSubscription(channelId, false);
      setSubscriptions(prev => prev.filter(channel => channel.id !== channelId));
    } catch (err) {
      setError('Failed to unsubscribe. Please try again.');
    }
  };

  const handleNotificationToggle = async (channelId, currentState) => {
    try {
      await updateNotificationSettings(channelId, !currentState);
      const updatedSubscriptions = subscriptions.map(channel =>
        channel.id === channelId
          ? { ...channel, notificationsEnabled: !currentState }
          : channel
      );
      setSubscriptions(updatedSubscriptions);
    } catch (err) {
      setError('Failed to update notification settings.');
    }
  };

  const handleChannelClick = (channelId) => {
    navigate(`/channel/${channelId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadSubscriptions} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {subscriptions.length} subscribed channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subscriptions..."
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
              <option value="oldest">Oldest subscriptions</option>
              <option value="name">Channel name</option>
              <option value="subscribers">Subscriber count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching subscriptions' : 'No subscriptions yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start following channels to see them here'
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
            {currentItems.map((channel, index) => (
              <div
                key={channel.id}
                className={`p-6 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors ${
                  index !== currentItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Channel Avatar */}
                    <div className="relative">
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {channel.owner && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="font-semibold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          onClick={() => handleChannelClick(channel.id)}
                        >
                          {channel.name}
                        </h3>
                        {channel.subscriberCount > 10000 && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
                        {channel.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{channel.subscriberCount.toLocaleString()} subscribers</span>
                        </div>
                        {channel.owner && (
                          <div className="flex items-center gap-1">
                            <span>by {channel.owner.firstName || channel.owner.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleNotificationToggle(channel.id, channel.notificationsEnabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        channel.notificationsEnabled
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                      }`}
                      title={channel.notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                    >
                      {channel.notificationsEnabled ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleChannelClick(channel.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View channel"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUnsubscribe(channel.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Unsubscribe"
                    >
                      <Trash2 className="w-4 h-4" />
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
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
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 text-gray-900 dark:text-white'
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionsList;

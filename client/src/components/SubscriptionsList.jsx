// SubscriptionsList.jsx
// This component displays a list of user subscriptions with search, filter, and pagination functionalities.
// It allows users to unsubscribe from channels and toggle notification settings.
// The UI is designed to be responsive and visually appealing with gradients and shadows.
// The component handles loading and error states gracefully.
// It also provides feedback when there are no subscriptions or search results.
// / The ChannelCard component is assumed to handle displaying individual channel details and actions.
// The fetchUserSubscriptions and toggleSubscription functions are assumed to interact with an API to fetch and update subscription data.
// The LoadingSpinner and ErrorMessage components are assumed to provide user feedback during loading and error states.


import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ChevronRight, Bell, BellOff, Sparkles, TrendingUp, Award } from 'lucide-react';
import { fetchUserSubscriptions, toggleSubscription } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ChannelCard from './ChannelCard';

const SubscriptionsList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

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
      channel.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscribers':
          return b.subscriberCount - a.subscriberCount;
        case 'recent':
          return new Date(b.subscribedAt) - new Date(a.subscribedAt);
        default:
          return 0;
      }
    });

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  const handleUnsubscribe = async (channelId) => {
    try {
      await toggleSubscription(channelId, false);
      setSubscriptions(prev => prev.filter(channel => channel.id !== channelId));
    } catch (err) {
      setError('Failed to unsubscribe. Please try again.');
    }
  };

  const handleNotificationToggle = async (channelId, currentState) => {
    try {
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadSubscriptions} />;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8 relative">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">My Subscriptions</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                Manage your {subscriptions.length} premium channels
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">All Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="text-indigo-400 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md font-medium"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Filter className="text-indigo-400 w-5 h-5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-12 pr-8 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px] appearance-none cursor-pointer shadow-sm hover:shadow-md font-medium"
            >
              <option value="name">Sort by Name</option>
              <option value="subscribers">Sort by Subscribers</option>
              <option value="recent">Recently Subscribed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm ? 'No matching subscriptions' : 'No subscriptions yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start following channels to see them here'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-10">
            {currentItems.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onUnsubscribe={handleUnsubscribe}
                onNotificationToggle={handleNotificationToggle}
                showSubscriptionActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
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

// This component displays a list of user subscriptions with search, filter, and pagination functionalities.
// It allows users to unsubscribe from channels and toggle notification settings.
// The UI is designed to be responsive and visually appealing with gradients and shadows.
// The component handles loading and error states gracefully.
// It also provides feedback when there are no subscriptions or search results.
// / The ChannelCard component is assumed to handle displaying individual channel details and actions.
// The fetchUserSubscriptions and toggleSubscription functions are assumed to interact with an API to fetch and update subscription data.
// The LoadingSpinner and ErrorMessage components are assumed to provide user feedback during loading and error states.

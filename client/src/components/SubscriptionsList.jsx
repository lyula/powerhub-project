import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ChevronRight, Bell, BellOff } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-[#0bb6bc]" />
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Manage your {subscriptions.length} channel subscriptions
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[160px] appearance-none cursor-pointer"
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
        <div className="text-center py-16">
          <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching subscriptions' : 'No subscriptions yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start following channels to see them here'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-4 py-2 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#0bb6bc]/90 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-8">
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
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                      currentPage === page
                        ? 'bg-[#0bb6bc] text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
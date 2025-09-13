// SubscribersList.jsx
// This component displays a list of subscribers with search, sorting, and pagination functionalities.
// It fetches subscriber data from an API and provides a user-friendly interface for managing subscribers.
// The UI is designed to be responsive and visually appealing with gradients, shadows, and hover effects.
// The component handles loading and error states gracefully.
// It also provides feedback when there are no subscribers or search results.
// The SubscriberCard component is assumed to handle displaying individual subscriber details.
// The fetchChannelSubscribers function is assumed to interact with an API to fetch subscriber data.
// The LoadingSpinner and ErrorMessage components are assumed to provide user feedback during loading and error states.
// The lucide-react library is used for icons, and Tailwind CSS classes are applied for styling.
// The component is exported for use in other parts of the application.


import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, TrendingUp, Calendar, Users, Sparkles, Crown, Target } from 'lucide-react';
import { fetchChannelSubscribers } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SubscriberCard from './SubscriberCard';

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    growthRate: 0
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
      const data = await fetchChannelSubscribers();
      setSubscribers(data.subscribers);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load subscribers. Please try again.');
      console.error('Error loading subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubscribers = () => {
    let filtered = subscribers.filter(subscriber =>
      subscriber.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.username.localeCompare(b.username);
        case 'recent':
          return new Date(b.subscribedAt) - new Date(a.subscribedAt);
        case 'oldest':
          return new Date(a.subscribedAt) - new Date(b.subscribedAt);
        default:
          return 0;
      }
    });

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadSubscribers} />;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8 relative">
      {/* Header with Stats */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">My Subscribers</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                Your growing community of {stats.total.toLocaleString()} members
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Creator</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Subscribers</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.thisMonth.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">+{stats.growthRate}%</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="text-purple-400 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md font-medium"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Filter className="text-purple-400 w-5 h-5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-12 pr-8 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px] appearance-none cursor-pointer shadow-sm hover:shadow-md font-medium"
            >
              <option value="recent">Recently Joined</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Grid */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Share your channel to start gaining subscribers'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <Target className="w-4 h-4" />
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-10">
            {currentItems.map((subscriber) => (
              <SubscriberCard
                key={subscriber.id}
                subscriber={subscriber}
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
                      className={`px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md'
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

export default SubscribersList;

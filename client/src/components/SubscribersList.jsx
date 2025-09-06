import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, TrendingUp, Calendar, Users } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8">
      {/* Header with Stats */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-[#0bb6bc]" />
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">My Subscribers</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscribers</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString()}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-[#0bb6bc]" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth.toLocaleString()}</p>
              </div>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#0bb6bc]" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-xl md:text-2xl font-bold text-[#0bb6bc]">+{stats.growthRate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#0bb6bc]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subscribers..."
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
              <option value="recent">Recently Joined</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Grid */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-16">
          <UserCheck className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Share your channel to start gaining subscribers'
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
            {currentItems.map((subscriber) => (
              <SubscriberCard
                key={subscriber.id}
                subscriber={subscriber}
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
                          ? 'bg-[#0bb6bc] text-white'
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

export default SubscribersList;
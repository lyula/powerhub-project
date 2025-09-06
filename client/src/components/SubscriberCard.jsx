import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

const SubscriberCard = ({ subscriber }) => {
  const {
    id,
    username,
    email,
    profileImage,
    subscribedAt,
    location,
    isActive
  } = subscriber;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const subscribeDate = new Date(dateString);
    const diffInDays = Math.floor((now - subscribeDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="p-4 md:p-6">
        {/* Subscriber Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={profileImage}
              alt={`${username} profile`}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
            />
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">{username}</h3>
              <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{email}</p>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Joined {getTimeAgo(subscribedAt)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Subscribed on {formatDate(subscribedAt)}
            </span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="px-4 md:px-6 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-2 md:px-3 bg-[#0bb6bc]/10 text-[#0bb6bc] border border-[#0bb6bc]/20 rounded-lg text-xs md:text-sm font-medium hover:bg-[#0bb6bc]/20 transition-colors">
            View Profile
          </button>
          <button className="py-2 px-2 md:px-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;
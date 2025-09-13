// SubscriberCard.jsx
// This component displays detailed information about a subscriber.
// It includes the subscriber's profile image, username, email, location, subscription date, and status (active/inactive).
// The card features interactive hover effects, such as shadow enhancements and action buttons for viewing the profile and sending a message.
// The design incorporates gradients, icons, and responsive typography to create an engaging user interface.
// The component uses Tailwind CSS for styling and lucide-react for icons.

import React from 'react';
import { Calendar, MapPin, ExternalLink, Star, MessageCircle, Zap } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-purple-100 dark:hover:shadow-gray-900/50 transition-all duration-500 group hover:-translate-y-2 backdrop-blur-sm">
      <div className="p-4 md:p-6">
        {/* Subscriber Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={profileImage}
              alt={`${username} profile`}
              className="w-14 h-14 rounded-full object-cover border-3 border-gradient-to-r from-purple-200 to-pink-200 shadow-lg group-hover:shadow-xl transition-all duration-300"
            />
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-2 h-2 text-white" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{username}</h3>
              <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all transform hover:scale-110">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate font-medium">{email}</p>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">Joined {getTimeAgo(subscribedAt)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              Subscribed on {formatDate(subscribedAt)}
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              isActive 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-green-100' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="px-4 md:px-6 pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-2 md:px-4 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 rounded-xl text-xs md:text-sm font-semibold hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md shadow-purple-100">
            View Profile
          </button>
          <button className="py-3 px-2 md:px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl text-xs md:text-sm font-semibold hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;


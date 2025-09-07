import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, MoreVertical, Check, X, Trash2, Settings } from 'lucide-react';
import Header from "../components/Header";

// Mock MobileHeader component
const MobileHeader = ({ icon, label, rightAction }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#181818] border-b border-gray-200 dark:border-gray-700 md:hidden">
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <h1 className="text-lg font-semibold text-black dark:text-white">{label}</h1>
      </div>
      {rightAction && (
        <div className="flex items-center gap-2">
          {rightAction}
        </div>
      )}
    </div>
  </div>
);

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      user: 'John Doe',
      action: 'liked your video',
      target: 'Introduction to React',
      time: '2 hours ago',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      user: 'Jane Smith',
      action: 'commented on your post',
      target: 'Best practices for coding',
      time: '5 hours ago',
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 3,
      type: 'subscribe',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      user: 'Alice Johnson',
      action: 'subscribed to your channel',
      target: '',
      time: '1 day ago',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 4,
      type: 'like',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      user: 'Bob Wilson',
      action: 'liked your video',
      target: 'Advanced JavaScript Tips',
      time: '2 days ago',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 5,
      type: 'comment',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
      user: 'Emma Davis',
      action: 'replied to your comment',
      target: 'CSS Grid Tutorial',
      time: '3 days ago',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      read: true,
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    const iconProps = { size: 16, className: "text-white" };
    switch (type) {
      case 'like':
        return <Heart {...iconProps} fill="currentColor" />;
      case 'comment':
        return <MessageCircle {...iconProps} />;
      case 'subscribe':
        return <UserPlus {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getIconBgColor = (type) => {
    switch (type) {
      case 'like':
        return 'bg-red-500';
      case 'comment':
        return 'bg-blue-500';
      case 'subscribe':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotifications(prev => prev.filter(nId => nId !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleSelection = useCallback((id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  }, []);

  const bulkMarkAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, read: true } : n)
    );
    setSelectedNotifications([]);
    setShowBulkActions(false);
  }, [selectedNotifications]);

  const bulkDelete = useCallback(() => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setShowBulkActions(false);
  }, [selectedNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const NotificationCard = ({ notification, isSelected, onToggleSelection }) => (
    <div
      className={`group relative p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
        notification.read
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
      } hover:shadow-lg hover:scale-[1.01] cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => !notification.read && markAsRead(notification.id)}
    >
      {showBulkActions && (
        <div 
          className="absolute top-3 left-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(notification.id);
          }}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
          }`}>
            {isSelected && <Check size={12} className="text-white" />}
          </div>
        </div>
      )}

      <div className={`flex items-start gap-3 ${showBulkActions ? 'ml-8' : ''}`}>
        <div className="relative flex-shrink-0">
          <img
            src={notification.avatar}
            alt={notification.user}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.user)}&background=random&size=48`;
            }}
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getIconBgColor(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 transition-all duration-200 group-hover:opacity-60">
                <span className="font-semibold">{notification.user}</span>{' '}
                <span className="font-normal">{notification.action}</span>
                {notification.target && (
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {' "' + notification.target + '"'}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {notification.time}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle notification menu
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <MoreVertical size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action buttons on hover */}
      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-full group-hover:translate-y-0">
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl px-4 py-2 flex justify-end gap-2">
          {!notification.read ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="text-xs px-2 py-1 text-blue-600 bg-transparent hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              Mark as read
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsUnread(notification.id);
              }}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Mark as unread
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#181818] text-black dark:text-white">
      <MobileHeader
        icon={
          <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-gray-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
        label="Notifications"
        rightAction={
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        }
      />
  <Header />
  {/* Increased spacing below header */}
  <div
    className="pt-20 md:pt-8 px-4 py-6 max-w-4xl mx-auto overflow-y-auto scrollbar-hide"
    style={{ maxHeight: 'calc(100vh - 80px)' }}
  >
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                showBulkActions
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showBulkActions ? 'Cancel' : 'Select'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedNotifications.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedNotifications.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkMarkAsRead}
                  className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Mark as read
                </button>
                <button
                  onClick={bulkDelete}
                  className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.includes(notification.id)}
                onToggleSelection={toggleSelection}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              Load more notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
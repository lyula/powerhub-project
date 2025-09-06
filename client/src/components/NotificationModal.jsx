import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

const getIcon = (type) => {
  switch (type) {
    case 'like':
      return <Heart className="w-5 h-5 text-white" />;
    case 'comment':
      return <MessageCircle className="w-5 h-5 text-white" />;
    case 'subscribe':
      return <UserPlus className="w-5 h-5 text-white" />;
    default:
      return <UserPlus className="w-5 h-5 text-white" />;
  }
};

const getIconBgColor = (type) => {
  switch (type) {
    case 'like':
      return 'bg-gradient-to-br from-pink-600 to-rose-500';
    case 'comment':
      return 'bg-gradient-to-br from-blue-600 to-indigo-500';
    case 'subscribe':
      return 'bg-gradient-to-br from-emerald-500 to-teal-500';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
  }
};

const NotificationModal = ({ notifications, onClose, anchorRef }) => {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div 
      className="absolute z-50 mt-2 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transform transition-all duration-300 ease-in-out"
      style={{ top: 'calc(100% + 0.5rem)', marginLeft: '1rem', marginRight: '1rem' }}
    >
      <div className="p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
        </div>
        <button
          className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-md transition-colors duration-200"
          onClick={markAllAsRead}
          aria-label="Mark all notifications as read"
        >
          Mark all read
        </button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {localNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No new notifications
          </div>
        ) : (
          <ul className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {localNotifications.slice(0, 5).map((notif, idx) => (
              <li
                key={notif.id || idx}
                className={`p-4 flex items-start gap-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 ${
                  !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={notif.avatar || `https://picsum.photos/seed/${notif.id || idx}/40/40`}
                    alt={notif.user || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center ${getIconBgColor(notif.type)} border-2 border-white dark:border-gray-900 shadow-sm`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{notif.user || 'User'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notif.time || ''}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    <span className="font-medium">{notif.action || notif.title}</span>
                    {notif.target && (
                      <span className="text-blue-600 dark:text-blue-400"> "{notif.target}"</span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50">
        <Link
          to="/notifications"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationModal;
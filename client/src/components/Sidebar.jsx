
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdHome, MdWhatshot, MdVideoLibrary, MdSubscriptions, MdBookmark, MdFavoriteBorder, MdPlayCircleOutline, MdHistory, MdNotificationsNone, MdPersonOutline, MdLogout } from 'react-icons/md';
import React, { useRef, useState, useEffect } from 'react';
import NotificationModal from './NotificationModal';

const items = [
  { label: 'Home', icon: <MdHome size={24} />, path: '/home' },
  { label: 'Trending', icon: <MdWhatshot size={24} />, path: '/home' },
  { label: 'My Channel', icon: <MdVideoLibrary size={24} />, isChannel: true },
  { label: 'Subscriptions', icon: <MdSubscriptions size={24} />, path: '/subscriptions' },
  { label: 'Saved Videos', icon: <MdBookmark size={24} />, path: '/saved-videos' },
  { label: 'Liked Videos', icon: <MdFavoriteBorder size={24} />, path: '/liked-videos' },
  { label: 'Course Videos', icon: <MdPlayCircleOutline size={24} />, path: '/course-videos' },
  { label: 'Watch History', icon: <MdHistory size={24} />, path: '/watch-history' },
  { label: 'Notifications', icon: <MdNotificationsNone size={24} />, path: '/notifications' },
  { label: 'Profile', icon: <MdPersonOutline size={24} />, path: '/profile' },
  { label: 'Logout', icon: <MdLogout size={24} color="#c42152" />, logout: true },
];

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const { channel, logout } = useAuth();

  return (
    <aside className={`hidden md:flex flex-col min-h-screen bg-gray-100 dark:bg-[#111111] border-r border-gray-200 dark:border-gray-900 py-6 ${collapsed ? 'w-20 px-2' : 'w-64 px-4'}`}>
      <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-48px)]">
        {items.map((item) => {
          if (item.logout) {
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 transition ${collapsed ? 'justify-center' : ''}`}
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }
          if (item.isChannel) {
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
                onClick={() => {
                  if (channel && channel._id) {
                    navigate(`/channel/${channel._id}`);
                  } else {
                    navigate('/channel-setup');
                  }
                }}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }
          if (item.path) {
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="w-6 h-6">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

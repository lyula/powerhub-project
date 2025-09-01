import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, AcademicCapIcon, VideoCameraIcon, UserIcon, NotificationBellIcon } from './icons';
import { PlusSquareIcon } from './PlusSquareIcon';

export default function BottomTabs() {
  const navigate = useNavigate();
  const { channel } = useAuth();
  const items = [
    { label: 'Home', icon: <HomeIcon />, path: '/home' },
    {
      label: 'My Videos',
      icon: <VideoCameraIcon />,
      getPath: () => (channel && channel._id ? `/channel/${channel._id}` : '/channel-setup'),
    },
    { label: 'Create', icon: <PlusSquareIcon />, path: '/create-post' },
    { label: 'Notifications', icon: <NotificationBellIcon />, path: '/notifications' },
    { label: 'Profile', icon: <UserIcon />, path: '/profile' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 w-full flex md:hidden bg-gray-100 dark:bg-[#111111] border-t border-gray-200 dark:border-gray-900 py-2 px-4 justify-between z-50">
      {items.map((item) => (
        <button
          key={item.label}
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[#0bb6bc] dark:hover:text-[#0bb6bc] transition"
          onClick={() => navigate(item.getPath ? item.getPath() : item.path)}
        >
          <span className="w-6 h-6">{item.icon}</span>
          <span className="text-xs sm:text-sm md:text-base">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ...existing code...

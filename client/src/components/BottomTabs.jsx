import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, FireIcon, AcademicCapIcon, VideoCameraIcon, UserIcon } from './icons';

const items = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Trending', icon: <FireIcon />, path: '/trending' },
  { label: 'Specializations', icon: <AcademicCapIcon />, path: '/specializations' },
  { label: 'My Videos', icon: <VideoCameraIcon />, path: '/my-videos' },
  { label: 'Profile', icon: <UserIcon />, path: '/profile' },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 w-full flex md:hidden bg-gray-100 dark:bg-[#111111] border-t border-gray-200 dark:border-gray-900 py-2 px-4 justify-between z-50">
      {items.map((item) => (
        <button
          key={item.label}
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[#0bb6bc] dark:hover:text-[#0bb6bc] transition"
          onClick={() => navigate(item.path)}
        >
          <span className="w-6 h-6">{item.icon}</span>
          <span className="text-xs sm:text-sm md:text-base">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

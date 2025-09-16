import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { 
  MdPerson, 
  MdNotifications, 
  MdSettings, 
  MdDashboard, 
  MdHome, 
  MdWhatshot, 
  MdSubscriptions, 
  MdBookmark, 
  MdFavoriteBorder, 
  MdPlayCircleOutline, 
  MdHistory, 
  MdPersonOutline,
  MdLogout 
} from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const MobileSidebar = ({ isOpen, toggleSidebar }) => {
  const { user, channel, logout } = useAuth();
  const navigate = useNavigate();
  
  const sidebarLinks = [
    { name: 'Home', path: '/home', icon: <MdHome size={20} /> },
    { name: 'Trending', path: '/home', icon: <MdWhatshot size={20} /> },
    { name: 'My Channel', path: channel && channel._id ? `/channel/${channel._id}` : '/channel-setup', icon: <MdPerson size={20} /> },
    { name: 'Subscriptions', path: '/subscriptions', icon: <MdSubscriptions size={20} /> },
    { name: 'Saved Videos', path: '/saved-videos', icon: <MdBookmark size={20} /> },
    { name: 'Liked Videos', path: '/liked-videos', icon: <MdFavoriteBorder size={20} /> },
    { name: 'Course Videos', path: '/course-videos', icon: <MdPlayCircleOutline size={20} /> },
    { name: 'Watch History', path: '/watch-history', icon: <MdHistory size={20} /> },
    { name: 'Collaborations', path: '/mobile-collaboration-options', icon: <FaGithub size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <MdNotifications size={20} /> },
    { name: 'Profile', path: '/profile', icon: <MdPersonOutline size={20} /> },
    // Only show IT Dashboard for users with IT role
    ...(user && user.role === 'IT' ? [{ name: 'IT Dashboard', path: '/it-dashboard', icon: <MdDashboard size={20} /> }] : []),
    { name: 'Settings', path: '/settings', icon: <MdSettings size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toggleSidebar(); // Close sidebar
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Menu
        </h2>
        <button
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
          onClick={toggleSidebar}
        >
          <MdClose size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <div className="flex items-start justify-start py-2 pl-6">
        <img 
          src="/PLP-logo.jpg" 
          alt="PLP Logo" 
          className="w-20 h-auto mb-4 rounded-lg shadow-sm"
        />
      </div>
      <nav className="mt-4 flex-1">
        <ul className="space-y-4 px-4">
          {sidebarLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="flex items-center gap-3 text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={toggleSidebar}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Logout button at the bottom */}
        <div className="px-4 mt-8 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full"
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileSidebar;

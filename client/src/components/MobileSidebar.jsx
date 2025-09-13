import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { MdPerson, MdNotifications, MdSettings, MdDashboard } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const MobileSidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  const sidebarLinks = [
    { name: 'My Channel', path: '/my-channel', icon: <MdPerson size={20} /> },
    { name: 'Collaborations', path: '/mobile-collaboration-options', icon: <FaGithub size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <MdNotifications size={20} /> },
    // Only show IT Dashboard for users with IT role
    ...(user && user.role === 'IT' ? [{ name: 'IT Dashboard', path: '/it-dashboard', icon: <MdDashboard size={20} /> }] : []),
    { name: 'Settings', path: '/settings', icon: <MdSettings size={20} /> },
  ];

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
      <nav className="mt-4">
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
      </nav>
    </div>
  );
};

export default MobileSidebar;

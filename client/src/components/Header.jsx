import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaVideo, FaRegEdit } from 'react-icons/fa';
import { MdMenu, MdNotificationsNone, MdLogout } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationModal from './NotificationModal';

export default function Header({ onToggleSidebar }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const modalRoot = typeof window !== 'undefined' ? document.body : null;
  const navigate = useNavigate();
  const { user, logout, channel } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  const handleThemeToggle = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      console.log('[ThemeToggle] Removed dark class from <html>');
    } else {
      document.documentElement.classList.add('dark');
      console.log('[ThemeToggle] Added dark class to <html>');
    }
    // Always update state based on actual DOM
    setIsDark(document.documentElement.classList.contains('dark'));
    console.log('[ThemeToggle] isDark:', document.documentElement.classList.contains('dark'), '| <html>.classList:', document.documentElement.classList.value);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-gray-100 dark:bg-[#111111] border-b border-gray-200 dark:border-gray-900 px-4 py-3 flex items-center justify-between" style={{ minHeight: '56px', height: '56px', overflow: 'hidden', scrollbarWidth: 'none' }}>
      <style>{`
        header::-webkit-scrollbar { display: none !important; }
        header { scrollbar-width: none !important; }
      `}</style>
  <div className="flex items-center gap-4 w-full min-w-0">
        <button
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 focus:outline-none"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <MdMenu size={28} color="#0bb6bc" />
        </button>
            <a href="/" className="hidden md:inline text-lg font-bold" style={{ textDecoration: 'none' }}>
              <span style={{ color: '#c42152' }}>PLP</span>
              <span className="text-[#0bb6bc] dark:text-[#0bb6bc]"> PowerHub</span>
            </a>
      </div>
  <div className="flex items-center gap-4 w-full justify-center min-w-0">
  <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search"
            className="pl-4 pr-12 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] placeholder-gray-400 w-full text-base border border-gray-300 dark:border-gray-700"
            style={{ height: '40px' }}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
            <div className="relative" style={{ position: 'relative', zIndex: 100 }}>
              <button
                className="relative hidden md:flex items-center justify-center px-2 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition hover:bg-gray-200 dark:hover:bg-[#222] focus:outline-none"
                aria-label="Notifications"
                style={{ minWidth: 40, height: 40, position: 'relative' }}
                onClick={() => {
                  setShowNotifModal((prev) => !prev);
                }}
                type="button"
              >
                <MdNotificationsNone size={26} color="#0bb6bc" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5" style={{ minWidth: 18, minHeight: 18, lineHeight: '18px' }}>3</span>
              </button>
              {showCreateModal && modalRoot && createPortal(
                <>
                  {/* Overlay to close modal when clicking outside */}
                  <div
                    className="fixed inset-0 z-[2147483646] bg-black bg-opacity-0"
                    onClick={() => setShowCreateModal(false)}
                  />
                  <div className="fixed" style={{ left: 'auto', top: '56px', right: '32px', zIndex: 2147483647, minWidth: 'max-content' }}>
                    <div className="w-44 bg-white dark:bg-[#222] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                      <button
                        className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-[#333] text-gray-800 dark:text-gray-200"
                        onClick={() => { setShowCreateModal(false); navigate('/upload'); }}
                      >
                        <FaVideo className="text-[#0bb6bc]" />
                        <span>Create Video</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-[#333] text-gray-800 dark:text-gray-200"
                        onClick={() => { setShowCreateModal(false); navigate('/create-post'); }}
                      >
                        <FaRegEdit className="text-[#c42152]" />
                        <span>Create Post</span>
                      </button>
                    </div>
                  </div>
                </>,
                modalRoot
              )}
            </div>

          {/* Notification Bell with Modal */}
          <div className="relative hidden md:inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#222] shadow hover:bg-gray-100 dark:hover:bg-[#333] transition focus:outline-none px-4" style={{ height: '40px', minWidth: '120px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            <button
              aria-label="Create"
              className="flex items-center gap-2 w-full justify-center"
              onClick={() => {
                if (!channel) {
                  navigate('/channel-setup');
                } else {
                  setShowCreateModal(true);
                }
              }}
            >
              <FaVideo className="text-[#c42152] dark:text-[#c42152]" size={22} />
              <span className="text-base font-semibold text-[#c42152] dark:text-[#c42152]">Create</span>
            </button>
            {showNotifModal && modalRoot && createPortal(
              <div style={{ position: 'absolute', top: '48px', right: 0, zIndex: 9999 }}>
                <NotificationModal
                  notifications={[
                    { id: 1, title: 'New comment on your video', body: 'Someone commented: "Great video!"' },
                    { id: 2, title: 'New subscriber', body: 'You have a new subscriber!' },
                    { id: 3, title: 'Video approved', body: 'Your video "React Basics" is now live.' },
                    { id: 4, title: 'Mentioned in a post', body: 'You were mentioned in a post.' },
                    { id: 5, title: 'Channel milestone', body: 'Congrats! 1000 subscribers.' },
                    { id: 6, title: 'Update available', body: 'A new feature is available.' },
                  ]}
                  onClose={() => setShowNotifModal(false)}
                />
              </div>,
              modalRoot
            )}
          </div>

        <button
          className="hidden md:flex items-center justify-center px-2 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition hover:bg-[#c42152] dark:hover:bg-[#222] focus:outline-none"
          aria-label="Toggle theme"
          style={{ minWidth: 40, height: 40 }}
          onClick={handleThemeToggle}
        >
          <ThemeToggle isDark={isDark} />
        </button>
        
        {/* User Info */}
        {user && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.username}
            </span>
          </div>
        )}
        
        {/* User Profile Picture or Avatar */}
        {user && (
          <button
            className="hidden md:flex items-center justify-center"
            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, maxWidth: 44, maxHeight: 44, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', padding: 0, cursor: 'pointer', border: 'none' }}
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                draggable={false}
              />
            ) : (
              <span
                style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e5e7eb', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}
              >
                {user.username ? user.username[0].toUpperCase() : <MdPersonOutline size={28} />}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}



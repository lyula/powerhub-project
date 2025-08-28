import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaVideo, FaRegEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogoutIcon } from './icons';

export default function Header({ onToggleSidebar }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const modalRoot = typeof window !== 'undefined' ? document.body : null;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
          <svg width="24" height="24" fill="none" stroke="#0bb6bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
  <span className="hidden md:inline text-lg font-bold text-[#0bb6bc] dark:text-[#0bb6bc]">PLP PowerHub</span>
      </div>
  <div className="flex items-center gap-4 w-full justify-center min-w-0">
        <input type="text" placeholder="Search videos..." className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] placeholder-gray-400 w-full max-w-md text-center text-base" style={{ height: '36px' }} />
            <div className="relative" style={{ position: 'relative', zIndex: 100 }}>
              <button
                className="hidden md:inline flex flex-row items-center gap-3 px-4 py-2 rounded-lg bg-[#c42152] text-white font-semibold hover:bg-[#0bb6bc] transition text-base"
                style={{ height: '36px', paddingTop: 0, paddingBottom: 0, width: 'auto', minWidth: 0 }}
                onClick={() => setShowCreateModal((prev) => !prev)}
              >
                <span className="text-lg font-bold">+</span>
                <span className="">Create</span>
              </button>
              {showCreateModal && modalRoot && createPortal(
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
        
        <button 
          className="hidden md:flex items-center justify-center px-2 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition hover:bg-red-500 dark:hover:bg-red-600 focus:outline-none" 
          aria-label="Logout" 
          style={{ minWidth: 40, height: 40 }}
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}



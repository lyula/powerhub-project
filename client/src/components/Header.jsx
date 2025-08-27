import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { LogoutIcon } from './icons';

export default function Header({ onToggleSidebar }) {
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
  return (
    <header className="w-full bg-gray-100 dark:bg-[#111111] border-b border-gray-200 dark:border-gray-900 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 w-full">
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
        <span className="hidden md:inline text-xl font-bold text-[#0bb6bc] dark:text-[#0bb6bc]">PLP PowerHub</span>
      </div>
      <div className="flex items-center gap-4 w-full justify-center">
        <input type="text" placeholder="Search videos..." className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] placeholder-gray-400 w-full max-w-xs text-center" />
        <button className="hidden md:inline px-4 py-2 rounded-lg bg-[#c42152] text-white font-semibold hover:bg-[#0bb6bc] transition">Upload</button>
        <button
          className="hidden md:flex items-center justify-center px-2 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition hover:bg-[#c42152] dark:hover:bg-[#222] focus:outline-none"
          aria-label="Toggle theme"
          style={{ minWidth: 40, height: 40 }}
          onClick={handleThemeToggle}
        >
          <ThemeToggle isDark={isDark} />
        </button>
        <button className="hidden md:flex items-center justify-center px-2 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition hover:bg-[#c42152] dark:hover:bg-[#222] focus:outline-none" aria-label="Logout" style={{ minWidth: 40, height: 40 }}>
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}

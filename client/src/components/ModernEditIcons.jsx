import React from 'react';

export const EditMediaIcon = () => (
  // Camera icon for media edit
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500 dark:text-blue-400">
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
  </svg>
);

export const EditAvatarIcon = () => (
  // User icon with camera overlay for avatar edit
  <span className="relative inline-block w-6 h-6">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute w-6 h-6 text-pink-500 dark:text-pink-400">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute w-3 h-3 right-0 bottom-0 text-blue-500 dark:text-blue-400">
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </span>
);
